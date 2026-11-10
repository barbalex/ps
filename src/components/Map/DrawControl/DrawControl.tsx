import { useEffect, useCallback, useRef } from 'react'
import * as L from 'leaflet'
// The fork's type declarations only augment the 'leaflet' module (map.geoman,
// layer events); the runtime default export is not declared, hence the cast.
import * as geomanModule from '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useMap } from 'react-leaflet'
import { bbox as getBbox } from '@turf/bbox'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { addOperationAtom } from '../../../store.ts'
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

// Persists the draw layer across component unmounts so drawn geometry
// stays visible on the map after drawing mode is deactivated.
let _persistentDrawLayer: L.FeatureGroup | null = null

// Style applied to the editable geometry so it stands out from the rest of the layer.
const EDITING_STYLE: L.PathOptions = {
  color: 'orange',
  fillColor: 'orange',
  fillOpacity: 0.2,
  weight: 3,
}

// Leaflet default path style — used to revert when editing mode ends.
const DEFAULT_STYLE: L.PathOptions = {
  color: '#3388ff',
  fillColor: '#3388ff',
  fillOpacity: 0.2,
  weight: 3,
}

const applyEditingStyle = (layer: L.Layer) => {
  if (typeof (layer as L.Path).setStyle === 'function') {
    ;(layer as L.Path).setStyle(EDITING_STYLE)
  }
}

const revertEditingStyle = (layer: L.Layer) => {
  if (typeof (layer as L.Path).setStyle === 'function') {
    ;(layer as L.Path).setStyle(DEFAULT_STYLE)
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
  const drawLayerRef = useRef<L.FeatureGroup | null>(null)

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const onEdit = useCallback(
    async (featureCollection: GeoJSON.FeatureCollection | undefined) => {
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

      const bbox = getBbox(featureCollection!)

      // Convert FeatureCollection to GeometryCollection for the PostGIS
      // geometry column, flattening nested collections: the draw layer can
      // contain the previously loaded collection as a single feature
      const geometryCollection =
        flattenToGeometryCollection(featureCollection!.features)

      // query previous geometry for the operation log
      const prevRes = await db.query(
        `SELECT ST_AsGeoJSON(geometry)::json as geometry, bbox FROM ${tableName} WHERE ${activeIdName} = $1`,
        [activeId],
      )
      const row = prevRes?.rows?.[0] ?? {}

      db.query(
        `UPDATE ${tableName} SET geometry = ST_GeomFromGeoJSON($1), bbox = $2 WHERE ${activeIdName} = $3`,
        [JSON.stringify(geometryCollection), bbox, activeId],
      )
      addOperation({
        table: tableName!,
        rowIdName: activeIdName!,
        rowId: activeId as string,
        operation: 'update',
        draft: { geometry: geometryCollection, bbox },
        prev: { ...row },
      })
    },
    [addOperation, db, editingAction, editingCheck, editingPlace],
  )

  useEffect(() => {
    const geoman = map.geoman
    if (!geoman) return

    // Remove any previously persisted draw layer (from a prior entity or session)
    if (_persistentDrawLayer && map.hasLayer(_persistentDrawLayer)) {
      map.removeLayer(_persistentDrawLayer)
    }

    const drawLayer = new L.FeatureGroup()
    map.addLayer(drawLayer)
    _persistentDrawLayer = drawLayer
    drawLayerRef.current = drawLayer

    const persist = () =>
      onEdit(drawLayer.toGeoJSON() as GeoJSON.FeatureCollection)

    // Persist when geoman's removal mode removes a layer from the draw layer
    drawLayer.on('layerremove', persist)

    // geoman:edit fires on every vertex move; persist only when a layer's
    // edit session ends (geoman:update) or a drag ends, to keep the
    // operation log free of intermediate states
    const wireLayerEvents = (layer: L.Layer) => {
      layer.on('geoman:update', persist)
      layer.on('geoman:dragend', persist)
    }

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
      db.query(
        `SELECT ST_AsGeoJSON(geometry)::json as geometry FROM ${tableName} WHERE ${activeIdName} = $1`,
        [activeId],
      ).then((result) => {
        const geometry = (
          result?.rows?.[0] as { geometry?: GeoJSON.GeoJsonObject } | undefined
        )?.geometry
        if (geometry && drawLayer) {
          try {
            // leaflet 2's GeoJSON types are narrower than the geojson
            // package's GeoJsonObject, but the values are compatible
            const geojsonArg =
              geometry as unknown as ConstructorParameters<typeof L.GeoJSON>[0]
            new L.GeoJSON(geojsonArg, {
              pointToLayer: (_feature, latlng) =>
                new L.CircleMarker(latlng, EDITING_STYLE),
            }).eachLayer((layer) => {
              applyEditingStyle(layer)
              wireLayerEvents(layer)
              drawLayer.addLayer(layer)
            })
          } catch {
            // ignore invalid geometry
          }
        }
      })
    }

    geoman.setLang('de')

    geoman.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircleMarker: false,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      drawText: false,
      drawCircle: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    })

    // A new layer was drawn: move it into the draw layer, style it and persist
    const onCreate = (e: L.LeafletEvent) => {
      let layer = (e as unknown as { layer: L.Layer }).layer
      // L.Marker doesn't support setStyle; replace with a circleMarker so
      // the orange edit style (and its revert) works uniformly for all types.
      if (layer instanceof L.Marker) {
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
      map
        .getContainer()
        .classList.toggle(GEOMAN_ACTIVE_CLASS, enabled || anyGeomanModeActive())
    }
    const onDrawStart = () =>
      map.getContainer().classList.add(GEOMAN_ACTIVE_CLASS)
    const onDrawEnd = () => {
      // fires on shape completion and on leaving draw mode; keep the class
      // while another geoman mode is still active
      if (!anyGeomanModeActive()) {
        map.getContainer().classList.remove(GEOMAN_ACTIVE_CLASS)
      }
    }
    map.on('geoman:drawstart', onDrawStart)
    map.on('geoman:drawend', onDrawEnd)
    map.on('geoman:globaldrawmodetoggled', setActive)
    map.on('geoman:globaleditmodetoggled', setActive)
    map.on('geoman:globalremovalmodetoggled', setActive)

    return () => {
      // Keep drawLayer on the map so drawn geometry stays visible after
      // drawing mode is deactivated. It will be removed on the next mount.
      // Revert orange editing style back to default.
      drawLayer.eachLayer(revertEditingStyle)
      drawLayer.off('layerremove', persist)
      geoman.removeControls()
      map.off('geoman:create', onCreate)
      map.off('geoman:drawstart', onDrawStart)
      map.off('geoman:drawend', onDrawEnd)
      map.off('geoman:globaldrawmodetoggled', setActive)
      map.off('geoman:globaleditmodetoggled', setActive)
      map.off('geoman:globalremovalmodetoggled', setActive)
      map.getContainer().classList.remove(GEOMAN_ACTIVE_CLASS)
    }
  }, [map, onEdit, db, editingPlace, editingCheck, editingAction])

  return null
}
