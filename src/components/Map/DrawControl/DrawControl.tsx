import { useEffect, useRef, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'
import * as L from 'leaflet'
// The fork's type declarations only augment the 'leaflet' module (map.geoman,
// layer events); the runtime default export is not declared, hence the cast.
import * as geomanModule from '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useMap } from 'react-leaflet'
import { bbox as getBbox } from '@turf/bbox'
import { usePGlite } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import {
  addOperationAtom,
  addNotificationAtom,
  languageAtom,
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
} from '../../../store.ts'
import styles from './PrecisePoint.module.css'
import { DrawToolbar } from './DrawToolbar.tsx'
import { showVectorSnapping } from './vectorSnapping.ts'
import { PrecisePoint } from './PrecisePoint.tsx'
import { flattenToGeometryCollection } from '../../../modules/repairNestedGeometries.ts'

const Geoman = (
  geomanModule as unknown as {
    default: { initialize(): void }
  }
).default

// Registers the init hooks that attach `map.geoman` / `layer.geoman`.
// Must run before the first map is created (module evaluation time is fine).
Geoman.initialize()

// Toggled on the map container while any geoman mode is active so
// ClickListener can ignore map clicks and CSS can adapt the cursor.
const GEOMAN_ACTIVE_CLASS = 'geoman-active'

// Toggled on the map container while geoman's removal mode is active: unlike
// drawing and vertex editing, deleting works by clicking the geometry itself,
// so its paths must be hit-testable again (see style.css)
const GEOMAN_REMOVAL_ACTIVE_CLASS = 'geoman-removal-active'

// class on the paths of the editable geometry — style.css scopes the
// hit-testing of the removal mode to it
const EDITING_CLASS = 'geometry-editing'

// Style applied to the editable geometry so it stands out from the rest of the layer.
const EDITING_STYLE: L.PathOptions = {
  color: 'orange',
  fillColor: 'orange',
  fillOpacity: 0.2,
  weight: 3,
  className: EDITING_CLASS,
}

const applyEditingStyle = (layer: L.Layer) => {
  if (typeof (layer as L.Path).setStyle === 'function') {
    ;(layer as L.Path).setStyle(EDITING_STYLE)
    // leaflet applies options.className only when it creates the path
    // element, so a layer that is already on the map needs the class added
    // directly (layer groups forward setStyle but have no element)
    const element = (layer as L.Path).getElement?.()
    element?.classList.add(EDITING_CLASS)
  }
}

type Props = {
  editingPlace?: string | false | null
  editingCheck?: string | false | null
  editingAction?: string | false | null
}

type Snapshot = {
  geometry: GeoJSON.GeometryCollection | null
  bbox: GeoJSON.BBox | null
  gps_accuracy_m: number | null
}
type Step = { before: Snapshot; after: Snapshot }

const isRingList = (
  coords: L.LatLng[][] | L.LatLng[][][],
): coords is L.LatLng[][] => coords.every((ring) => L.LineUtil.isFlat(ring))

export const DrawControlComponent = ({
  editingPlace,
  editingCheck,
  editingAction,
}: Props) => {
  const map = useMap()
  const language = useAtomValue(languageAtom)
  const [placePoint, setPlacePoint] = useState<
    ((position: L.LatLng, accuracy?: number | null) => Promise<void>) | null
  >(null)
  const [savedAccuracy, setSavedAccuracy] = useState<number | null>(null)
  const [modeActive, setModeActive] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [snapping, setSnapping] = useState(true)
  useEffect(() => {
    const geoman = map.geoman
    if (!geoman) return
    const previous = geoman.getGlobalOptions().allowSnapping ?? true
    if (previous === snapping) return
    geoman.setGlobalOptions({ allowSnapping: snapping })
    return () => {
      geoman.setGlobalOptions({ allowSnapping: previous })
    }
  }, [map, snapping])

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const notify = useSetAtom(addNotificationAtom)
  const finish = useSetAtom(
    editingPlace ? editingPlaceGeometryAtom
    : editingCheck ? editingCheckGeometryAtom
    : editingActionGeometryAtom,
  )
  const { formatMessage } = useIntl()
  const [label, setLabel] = useState('')
  const [history, setHistory] = useState({ undo: false, redo: false })
  const [busy, setBusy] = useState(false)
  const [replaying, setReplaying] = useState(false)
  const replay = useRef<(direction: 'undo' | 'redo') => void>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const geoman = map.geoman
    if (!geoman) return
    const activeId = editingPlace || editingCheck || editingAction
    if (!activeId) return
    const activeIdName =
      editingPlace ? 'place_id'
      : editingCheck ? 'check_id'
      : 'action_id'
    const tableName =
      editingPlace ? 'places'
      : editingCheck ? 'checks'
      : 'actions'
    const fields =
      'ST_AsGeoJSON(geometry, 17)::json as geometry, bbox, gps_accuracy_m'
    const undo: Step[] = []
    const redo: Step[] = []
    let loaded = false
    let pending = 0
    let queue = Promise.resolve()
    const report = (error: unknown) => {
      notify({
        intent: 'error',
        body: error instanceof Error ? error.message : String(error),
      })
    }
    const schedule = (work: () => Promise<void>) => {
      pending++
      setBusy(true)
      const result = queue.then(work)
      queue = result.catch(report).finally(() => {
        pending--
        setBusy(pending > 0)
        setHistory({ undo: !!undo.length, redo: !!redo.length })
      })
      return result
    }
    L.DomEvent.disableClickPropagation(panel.current!)
    L.DomEvent.disableScrollPropagation(panel.current!)

    const drawLayer = new L.FeatureGroup()
    map.addLayer(drawLayer)
    const stopSnapping = showVectorSnapping(
      map,
      drawLayer,
      activeId,
      formatMessage({ id: 'geometrySnapTarget', defaultMessage: 'Fangziel' }),
    )

    const write = async (draft: Snapshot, expected?: Snapshot) => {
      const deadline = performance.now() + 3000
      const isSessionVersion = (row: Snapshot, steps: Step[]) =>
        steps.some(
          (step) => isEqual(row, step.before) || isEqual(row, step.after),
        )
      const attempt = () =>
        db.transaction(async (tx) => {
          const before = (
            await tx.query<Snapshot>(
              `SELECT ${fields} FROM ${tableName} WHERE ${activeIdName} = $1`,
              [activeId],
            )
          ).rows[0]
          // Sync may have echoed the destination of a replay before its latest
          // write arrives. Still enqueue the explicit undo/redo in that case.
          const atDestination = isEqual(before, draft)
          if (
            !before ||
            (expected && !atDestination && !isEqual(before, expected))
          ) {
            // Electric can echo the previous undo before the latest one. Let
            // sync catch up outside this transaction; never overwrite a conflict.
            if (
              before &&
              performance.now() < deadline &&
              (isSessionVersion(before, redo) || isSessionVersion(before, undo))
            )
              return 'retry' as const
            throw new Error(
              formatMessage({
                id: 'geometryHistoryChanged',
                defaultMessage:
                  'Die Geometrie wurde inzwischen geändert. Bearbeitung erneut öffnen.',
              }),
            )
          }
          // Rapid nudges edit the displayed geometry, even if sync temporarily
          // puts one of this session's older versions back into PGlite.
          const displayed = undo.at(-1)?.after
          const source =
            expected ??
            ((
              displayed &&
              !isEqual(before, displayed) &&
              isSessionVersion(before, undo)
            ) ?
              displayed
            : before)
          if (!expected && isEqual(source, draft)) return
          const after = (
            await tx.query<Snapshot>(
              `UPDATE ${tableName} SET geometry = ST_GeomFromGeoJSON($1::text), bbox = $2, gps_accuracy_m = $3 WHERE ${activeIdName} = $4 RETURNING ${fields}`,
              [
                draft.geometry ? JSON.stringify(draft.geometry) : null,
                draft.bbox,
                draft.gps_accuracy_m,
                activeId,
              ],
            )
          ).rows[0]!
          return { before: source, after }
        })
      let step = await attempt()
      while (step === 'retry') {
        await new Promise((resolve) => setTimeout(resolve, 100))
        step = await attempt()
      }
      if (!step) return
      await addOperation({
        table: tableName,
        rowIdName: activeIdName,
        rowId: activeId,
        operation: 'update',
        draft,
        prev: step.before,
        separateEdit: true,
      })
      setSavedAccuracy(draft.gps_accuracy_m)
      return step
    }
    const onEdit = (
      fc: GeoJSON.FeatureCollection,
      accuracy: number | null = null,
    ) =>
      schedule(async () => {
        const step = await write({
          geometry:
            fc.features.length ?
              flattenToGeometryCollection(fc.features)
            : null,
          bbox: fc.features.length ? getBbox(fc) : null,
          gps_accuracy_m: accuracy,
        })
        if (step) {
          undo.push(step)
          redo.length = 0
        }
      })
    const persist = () => {
      if (loaded)
        void onEdit(drawLayer.toGeoJSON(false) as GeoJSON.FeatureCollection)
    }

    const container = map.getContainer()
    let selected: L.Polyline | L.CircleMarker | null = null
    const select = (layer: typeof selected) => {
      selected?.getElement()?.classList.remove('geometry-nudge-target')
      selected = layer
      selected?.getElement()?.classList.add('geometry-nudge-target')
      if (selected) container.focus({ preventScroll: true })
    }
    const nudge = (event: KeyboardEvent) => {
      if (
        !selected ||
        !drawLayer.hasLayer(selected) ||
        !geoman.globalDragModeEnabled() ||
        event.target !== container ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return
      const dx =
        event.key === 'ArrowRight' ? 1
        : event.key === 'ArrowLeft' ? -1
        : 0
      const dy =
        event.key === 'ArrowDown' ? 1
        : event.key === 'ArrowUp' ? -1
        : 0
      if (!dx && !dy) return
      event.preventDefault()
      event.stopPropagation()
      const pixels = ((event.shiftKey ? 2 : 0.3) * 96) / 25.4
      const offset = new L.Point(dx * pixels, dy * pixels)
      const shift = (position: L.LatLng) => {
        const moved = map.unproject(map.project(position).add(offset))
        return new L.LatLng(
          dy ? moved.lat : position.lat,
          dx ? moved.lng : position.lng,
          position.alt,
        )
      }
      if (selected instanceof L.CircleMarker)
        selected.setLatLng(shift(selected.getLatLng()))
      else {
        const coords = selected.getLatLngs()
        selected.setLatLngs(
          L.LineUtil.isFlat(coords) ? coords.map(shift)
          : isRingList(coords) ? coords.map((ring) => ring.map(shift))
          : coords.map((polygon) => polygon.map((ring) => ring.map(shift))),
        )
      }
      persist()
    }
    container.addEventListener('keydown', nudge, true)
    let draggingMode = false
    const onDragMode = () => {
      draggingMode = geoman.globalDragModeEnabled()
      setDragActive(draggingMode)
      if (!draggingMode) select(null)
    }
    map.on('geoman:globaldragmodetoggled', onDragMode)

    // Persist when geoman's removal mode removes a layer from the draw layer
    drawLayer.on('layerremove', persist)

    // geoman's removal mode only takes the clicked layer off the map — it
    // doesn't know about the draw layer, so drop it there too
    const onRemove = (e: L.LeafletEvent) => {
      const layer = (e as unknown as { layer: L.Layer }).layer
      if (drawLayer.hasLayer(layer)) drawLayer.removeLayer(layer)
    }
    map.on('geoman:remove', onRemove)

    // geoman:edit fires on every vertex move; persist only when a layer's
    // edit session ends (geoman:update) or a drag ends, to keep the
    // operation log free of intermediate states
    const wireLayerEvents = (layer: L.Layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        const selectLayer = () => {
          if (geoman.globalDragModeEnabled()) select(layer)
        }
        const path: L.Path = layer
        path.on('click', selectLayer)
        layer.on('geoman:dragend', selectLayer)
      }
      layer.on('geoman:update', () => {
        // Disabling drag also emits update; dragend already saved that edit.
        if (!draggingMode) persist()
      })
      layer.on('geoman:dragend', persist)
    }

    const refreshPointTool = () => {
      const layers = drawLayer.getLayers()
      const point = layers[0]
      if (
        !loaded ||
        layers.length > 1 ||
        (point &&
          (!(point instanceof L.CircleMarker) || point instanceof L.Circle))
      ) {
        setPlacePoint(null)
        return
      }
      setPlacePoint(
        () => async (position: L.LatLng, accuracy?: number | null) => {
          await onEdit(
            {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: [position.lng, position.lat],
                  },
                },
              ],
            },
            accuracy,
          )
          if (!map.hasLayer(drawLayer) || (point && !drawLayer.hasLayer(point)))
            return
          if (point instanceof L.CircleMarker) point.setLatLng(position)
          else {
            const marker = new L.CircleMarker(position, EDITING_STYLE)
            wireLayerEvents(marker)
            drawLayer.addLayer(marker)
          }
        },
      )
    }
    drawLayer.on('layeradd layerremove', refreshPointTool)

    const showSnapshot = ({ geometry, gps_accuracy_m }: Snapshot) => {
      loaded = false
      drawLayer.clearLayers()
      setSavedAccuracy(gps_accuracy_m)
      if (geometry) {
        // leaflet 2's GeoJSON types are narrower than the geojson
        // package's GeoJsonObject, but the values are compatible
        const geojsonArg = geometry as unknown as ConstructorParameters<
          typeof L.GeoJSON
        >[0]
        // L.GeoJSON nests the members of a GeometryCollection in an inner
        // layer group. The draw layer holds the geometry layers
        // themselves, like drawn ones — geoman's removal mode takes them
        // out one by one
        const addGeometryLayers = (layer: L.Layer) => {
          if (layer instanceof L.LayerGroup) {
            layer.eachLayer(addGeometryLayers)
            return
          }
          applyEditingStyle(layer)
          wireLayerEvents(layer)
          drawLayer.addLayer(layer)
        }
        new L.GeoJSON(geojsonArg, {
          pointToLayer: (_feature, latlng) =>
            new L.CircleMarker(latlng, EDITING_STYLE),
        }).eachLayer(addGeometryLayers)
      }
      loaded = true
      refreshPointTool()
    }
    replay.current = (direction) => {
      if (pending || !loaded) return
      setReplaying(true)
      void schedule(async () => {
        const source = direction === 'undo' ? undo : redo
        const target = direction === 'undo' ? redo : undo
        const step = source.at(-1)
        if (!step) return
        const snapshot = direction === 'undo' ? step.before : step.after
        const written = await write(
          snapshot,
          direction === 'undo' ? step.after : step.before,
        )
        if (!written) return
        source.pop()
        target.push(step)
        if (map.hasLayer(drawLayer)) {
          showSnapshot(snapshot)
        }
      })
      void queue.then(() => setReplaying(false))
    }
    db.query<Snapshot & { label: string | null }>(
      `SELECT ${fields}, label FROM ${tableName} WHERE ${activeIdName} = $1`,
      [activeId],
    )
      .then(({ rows }) => {
        if (!map.hasLayer(drawLayer) || !rows[0]) return
        setLabel(rows[0].label || activeId)
        showSnapshot(rows[0])
      })
      .catch(report)

    // A new layer was drawn: move it into the draw layer, style it and persist
    const onCreate = (e: L.LeafletEvent) => {
      let layer = (e as unknown as { layer: L.Layer }).layer
      // L.Marker doesn't support setStyle; replace with a circleMarker so
      // the orange edit style (and its revert) works uniformly for all types.
      // geoman added the marker to the map itself — take it off again, it
      // would otherwise stay there on top of the circleMarker
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
        layer = new L.CircleMarker(layer.getLatLng(), EDITING_STYLE)
      } else {
        applyEditingStyle(layer)
      }
      wireLayerEvents(layer)
      drawLayer.addLayer(layer)
      persist()
    }
    map.on('geoman:create', onCreate)

    // Toggle the active class so ClickListener suppresses click handling and
    // the cursor changes while drawing/editing/deleting.
    // The per-shape toolbar buttons fire geoman:drawstart/drawend (not the
    // global draw mode event), so both are handled here.
    const anyGeomanModeActive = () =>
      geoman.globalDrawModeEnabled() ||
      geoman.globalEditModeEnabled() ||
      geoman.globalDragModeEnabled() ||
      geoman.globalRemovalModeEnabled()
    const setActive = (e: L.LeafletEvent) => {
      const enabled = (e as unknown as { enabled: boolean }).enabled
      setModeActive(enabled || anyGeomanModeActive())
      map
        .getContainer()
        .classList.toggle(GEOMAN_ACTIVE_CLASS, enabled || anyGeomanModeActive())
    }
    const onDrawStart = () => {
      setModeActive(true)
      map.getContainer().classList.add(GEOMAN_ACTIVE_CLASS)
    }
    const onDrawEnd = () => {
      // fires on shape completion and on leaving draw mode; keep the class
      // while another geoman mode is still active
      if (!anyGeomanModeActive()) {
        setModeActive(false)
        map.getContainer().classList.remove(GEOMAN_ACTIVE_CLASS)
      }
    }
    map.on('geoman:drawstart', onDrawStart)
    map.on('geoman:drawend', onDrawEnd)
    map.on('geoman:globaldrawmodetoggled', setActive)
    map.on('geoman:globaleditmodetoggled', setActive)
    map.on('geoman:globaldragmodetoggled', setActive)
    map.on('geoman:globalremovalmodetoggled', setActive)
    // The removal mode deletes by clicking the geometry itself: let CSS make
    // the editable paths hit-testable again while it is on
    const setRemovalActive = (e: L.LeafletEvent) => {
      map
        .getContainer()
        .classList.toggle(
          GEOMAN_REMOVAL_ACTIVE_CLASS,
          (e as unknown as { enabled: boolean }).enabled,
        )
    }
    map.on('geoman:globalremovalmodetoggled', setRemovalActive)

    return () => {
      stopSnapping()
      container.removeEventListener('keydown', nudge, true)
      map.off('geoman:globaldragmodetoggled', onDragMode)
      if (geoman.globalDrawModeEnabled()) geoman.disableDraw()
      if (geoman.globalEditModeEnabled()) geoman.disableGlobalEditMode()
      if (geoman.globalDragModeEnabled()) geoman.disableGlobalDragMode()
      if (geoman.globalRemovalModeEnabled()) geoman.disableGlobalRemovalMode()
      replay.current = null
      drawLayer.off('layeradd layerremove', refreshPointTool)
      drawLayer.off('layerremove', persist)
      map.off('geoman:create', onCreate)
      map.off('geoman:remove', onRemove)
      map.off('geoman:drawstart', onDrawStart)
      map.off('geoman:drawend', onDrawEnd)
      map.off('geoman:globaldrawmodetoggled', setActive)
      map.off('geoman:globaleditmodetoggled', setActive)
      map.off('geoman:globaldragmodetoggled', setActive)
      map.off('geoman:globalremovalmodetoggled', setActive)
      map.off('geoman:globalremovalmodetoggled', setRemovalActive)
      map.removeLayer(drawLayer)
      map.getContainer().classList.remove(GEOMAN_ACTIVE_CLASS)
      map.getContainer().classList.remove(GEOMAN_REMOVAL_ACTIVE_CLASS)
    }
  }, [
    map,
    db,
    editingPlace,
    editingCheck,
    editingAction,
    addOperation,
    notify,
    formatMessage,
  ])

  return (
    <>
      <DrawToolbar
        key={language}
        language={language}
      />
      <div
        ref={panel}
        className={styles.session}
      >
        <span title={label}>
          {formatMessage(
            {
              id: 'geometryEditingRecord',
              defaultMessage: 'Geometrie bearbeiten: {name}',
            },
            { name: label },
          )}
        </span>
        {dragActive && (
          <div>
            {formatMessage({
              id: 'geometryNudgeHint',
              defaultMessage:
                'Geometrie anklicken oder ziehen. Pfeiltasten: 0,3 mm auf der Karte; mit Umschalt: 2 mm.',
            })}
          </div>
        )}
        <div className={styles.actions}>
          <Button
            size="small"
            appearance={snapping ? 'primary' : 'secondary'}
            disabled={modeActive}
            aria-pressed={snapping}
            onClick={() => setSnapping((value) => !value)}
          >
            {formatMessage({
              id: 'geometrySnapping',
              defaultMessage: 'Objektfang',
            })}
          </Button>
          <Button
            size="small"
            disabled={busy || modeActive || !history.undo}
            onClick={() => replay.current?.('undo')}
          >
            {formatMessage({
              id: 'undoDeleteUndo',
              defaultMessage: 'Rückgängig',
            })}
          </Button>
          <Button
            size="small"
            disabled={busy || modeActive || !history.redo}
            onClick={() => replay.current?.('redo')}
          >
            {formatMessage({
              id: 'geometryRedo',
              defaultMessage: 'Wiederholen',
            })}
          </Button>
          <Button
            size="small"
            appearance="primary"
            disabled={busy}
            onClick={() => finish(null)}
          >
            {formatMessage({ id: 'geometryDone', defaultMessage: 'Fertig' })}
          </Button>
        </div>
        {!modeActive && !replaying && placePoint && (
          <PrecisePoint
            apply={placePoint}
            savedAccuracy={savedAccuracy}
          />
        )}
      </div>
    </>
  )
}
