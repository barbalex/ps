import { useEffect, useCallback, useState } from 'react'
import * as L from 'leaflet'
// The fork's type declarations only augment the 'leaflet' module (map.geoman,
// layer events); the runtime default export is not declared, hence the cast.
import * as geomanModule from '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useMap } from 'react-leaflet'
import { bbox as getBbox } from '@turf/bbox'
import { usePGlite } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { addOperationAtom, languageAtom } from '../../../store.ts'
import { DrawToolbar } from './DrawToolbar.tsx'
import { PrecisePoint } from './PrecisePoint.tsx'
import { flattenToGeometryCollection } from '../../../modules/repairNestedGeometries.ts'

const Geoman = (geomanModule as unknown as {
  default: { initialize(): void }
}).default

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

export const DrawControlComponent = ({
  editingPlace,
  editingCheck,
  editingAction,
}: Props) => {
  const map = useMap()
  const language = useAtomValue(languageAtom)
  const [placePoint, setPlacePoint] = useState<((position: L.LatLng, accuracy?: number | null) => Promise<void>) | null>(null)
  const [savedAccuracy, setSavedAccuracy] = useState<number | null>(null)
  const [modeActive, setModeActive] = useState(false)

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const onEdit = useCallback(
    async (featureCollection: GeoJSON.FeatureCollection | undefined, accuracy: number | null = null) => {
      const activeId = editingPlace ?? editingCheck ?? editingAction
      const activeIdName = editingPlace
        ? 'place_id'
        : editingCheck
          ? 'check_id'
          : editingAction
            ? 'action_id'
            : null
      const tableName = editingPlace
        ? 'places'
        : editingCheck
          ? 'checks'
          : editingAction
            ? 'actions'
            : null

      // query previous geometry for the operation log
      const prevRes = await db.query(
        `SELECT ST_AsGeoJSON(geometry)::json as geometry, bbox, gps_accuracy_m FROM ${tableName} WHERE ${activeIdName} = $1`,
        [activeId],
      )
      const row = prevRes?.rows?.[0] ?? {}

      // deleting the last geometry leaves none: store that like for a row
      // that never had one
      if (!featureCollection!.features.length) {
        await db.query(
          `UPDATE ${tableName} SET geometry = NULL, bbox = NULL, gps_accuracy_m = NULL WHERE ${activeIdName} = $1`,
          [activeId],
        )
        addOperation({
          table: tableName!,
          rowIdName: activeIdName!,
          rowId: activeId as string,
          operation: 'update',
          draft: { geometry: null, bbox: null, gps_accuracy_m: null },
          prev: { ...row },
        })
        setSavedAccuracy(null)
        return
      }

      const bbox = getBbox(featureCollection!)

      // Convert FeatureCollection to GeometryCollection for the PostGIS
      // geometry column, flattening nested collections: the draw layer can
      // contain the previously loaded collection as a single feature
      const geometryCollection =
        flattenToGeometryCollection(featureCollection!.features)

      await db.query(
        `UPDATE ${tableName} SET geometry = ST_GeomFromGeoJSON($1), bbox = $2, gps_accuracy_m = $4 WHERE ${activeIdName} = $3`,
        [JSON.stringify(geometryCollection), bbox, activeId, accuracy],
      )
      addOperation({
        table: tableName!,
        rowIdName: activeIdName!,
        rowId: activeId as string,
        operation: 'update',
        draft: { geometry: geometryCollection, bbox, gps_accuracy_m: accuracy },
        prev: { ...row },
      })
      setSavedAccuracy(accuracy)
    },
    [addOperation, db, editingAction, editingCheck, editingPlace],
  )

  useEffect(() => {
    const geoman = map.geoman
    if (!geoman) return

    const drawLayer = new L.FeatureGroup()
    map.addLayer(drawLayer)

    const persist = () =>
      onEdit(drawLayer.toGeoJSON() as GeoJSON.FeatureCollection)

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
      layer.on('geoman:update', persist)
      layer.on('geoman:dragend', persist)
    }

    let loaded = false
    const refreshPointTool = () => {
      const layers = drawLayer.getLayers()
      const point = layers[0]
      if (!loaded || layers.length > 1 || (point && (!(point instanceof L.CircleMarker) || point instanceof L.Circle))) {
        setPlacePoint(null)
        return
      }
      setPlacePoint(() => async (position: L.LatLng, accuracy?: number | null) => {
        await onEdit({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature', properties: {},
            geometry: { type: 'Point', coordinates: [position.lng, position.lat] },
          }],
        }, accuracy)
        if (!map.hasLayer(drawLayer)) return
        if (point instanceof L.CircleMarker) point.setLatLng(position)
        else {
          const marker = new L.CircleMarker(position, EDITING_STYLE)
          wireLayerEvents(marker)
          drawLayer.addLayer(marker)
        }
      })
    }
    drawLayer.on('layeradd layerremove', refreshPointTool)

    // Load existing geometry from DB into the draw layer (so it is visible and editable)
    const activeId = editingPlace ?? editingCheck ?? editingAction
    const activeIdName = editingPlace
      ? 'place_id'
      : editingCheck
        ? 'check_id'
        : 'action_id'
    const tableName = editingPlace
      ? 'places'
      : editingCheck
        ? 'checks'
        : 'actions'
    if (activeId) {
      db.query<{ geometry: GeoJSON.GeoJsonObject | null; gps_accuracy_m: number | null }>(
        `SELECT ST_AsGeoJSON(geometry)::json as geometry, gps_accuracy_m FROM ${tableName} WHERE ${activeIdName} = $1`,
        [activeId],
      ).then((result) => {
        if (!map.hasLayer(drawLayer) || !result.rows.length) return
        setSavedAccuracy(result.rows[0]!.gps_accuracy_m)
        const geometry = (
          result?.rows?.[0] as { geometry?: GeoJSON.GeoJsonObject } | undefined
        )?.geometry
        if (geometry && map.hasLayer(drawLayer)) {
          try {
            // leaflet 2's GeoJSON types are narrower than the geojson
            // package's GeoJsonObject, but the values are compatible
            const geojsonArg =
              geometry as unknown as ConstructorParameters<typeof L.GeoJSON>[0]
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
          } catch {
            // ignore invalid geometry
            return
          }
        }
        loaded = true
        refreshPointTool()
      })
    }

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
      onEdit(drawLayer.toGeoJSON() as GeoJSON.FeatureCollection)
    }
    map.on('geoman:create', onCreate)

    // Toggle the active class so ClickListener suppresses click handling and
    // the cursor changes while drawing/editing/deleting.
    // The per-shape toolbar buttons fire geoman:drawstart/drawend (not the
    // global draw mode event), so both are handled here.
    const anyGeomanModeActive = () =>
      geoman.globalDrawModeEnabled() ||
      geoman.globalEditModeEnabled() ||
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
      drawLayer.off('layeradd layerremove', refreshPointTool)
      drawLayer.off('layerremove', persist)
      map.off('geoman:create', onCreate)
      map.off('geoman:remove', onRemove)
      map.off('geoman:drawstart', onDrawStart)
      map.off('geoman:drawend', onDrawEnd)
      map.off('geoman:globaldrawmodetoggled', setActive)
      map.off('geoman:globaleditmodetoggled', setActive)
      map.off('geoman:globalremovalmodetoggled', setActive)
      map.off('geoman:globalremovalmodetoggled', setRemovalActive)
      map.removeLayer(drawLayer)
      map.getContainer().classList.remove(GEOMAN_ACTIVE_CLASS)
      map.getContainer().classList.remove(GEOMAN_REMOVAL_ACTIVE_CLASS)
    }
  }, [map, onEdit, db, editingPlace, editingCheck, editingAction])

  return <>
    <DrawToolbar key={language} language={language} />
    {!modeActive && placePoint && <PrecisePoint apply={placePoint} savedAccuracy={savedAccuracy} />}
  </>
}
