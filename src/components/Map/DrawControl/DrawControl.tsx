import { useEffect, useCallback, useRef } from 'react'
import 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useMap, useMapEvents } from 'react-leaflet'
import { bbox as getBbox } from '@turf/bbox'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { addOperationAtom } from '../../../store.ts'

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

L.drawLocal.draw.toolbar.buttons.polygon = 'Polygon(e) zeichnen, um zu filtern'
L.drawLocal.draw.toolbar.buttons.rectangle =
  'Rechteck(e) zeichnen, um zu filtern'
L.drawLocal.draw.toolbar.actions.title = 'Zeichnen rückgängig machen'
L.drawLocal.draw.toolbar.actions.text = 'rückgängig machen'
L.drawLocal.draw.toolbar.finish.title = 'Zeichnen beenden'
L.drawLocal.draw.toolbar.finish.text = 'beenden'
L.drawLocal.draw.toolbar.undo.title = 'Zuletzt erfassten Punkt löschen'
L.drawLocal.draw.toolbar.undo.text = 'letzten Punkt löschen'
L.drawLocal.draw.handlers.polygon.tooltip.start =
  'Klicken um Polygon zu beginnen'
L.drawLocal.draw.handlers.polygon.tooltip.cont =
  'Klicken um Polygon weiter zu zeichnen'
L.drawLocal.draw.handlers.polygon.tooltip.end =
  'ersten Punkt klicken, um Polygon zu beenden'
L.drawLocal.draw.handlers.rectangle.tooltip.start =
  'Klicken und ziehen, um Rechteck zu zeichnen'
L.drawLocal.edit.toolbar.actions.save.title = 'Zeichnung speichern'
L.drawLocal.edit.toolbar.actions.save.text = 'speichern'
L.drawLocal.edit.toolbar.actions.cancel.title =
  'Zeichnung abbrechen und verwerfen'
L.drawLocal.edit.toolbar.actions.cancel.text = 'abbrechen'
// L.drawLocal.edit.toolbar.actions.clearAll.title = 'alle Umrisse löschen'
// L.drawLocal.edit.toolbar.actions.clearAll.text = 'alle löschen'
L.drawLocal.edit.toolbar.buttons.edit = 'Umriss(e) ändern'
L.drawLocal.edit.toolbar.buttons.editDisabled =
  'Umriss(e) ändern (aktuell gibt es keine)'
L.drawLocal.edit.toolbar.buttons.remove = 'Umriss(e) löschen'
L.drawLocal.edit.toolbar.buttons.removeDisabled =
  'Umriss(e) löschen (aktuell gibt es keine)'
L.drawLocal.edit.handlers.edit.tooltip.text = `dann auf 'speichern' klicken`
L.drawLocal.edit.handlers.edit.tooltip.subtext =
  'Punkte ziehen, um Umriss(e) zu verändern'
L.drawLocal.edit.handlers.remove.tooltip.text = `zum Löschen auf Umriss klicken, dann auf 'speichern'`

export const DrawControlComponent = ({
  editingPlace,
  editingCheck,
  editingAction,
}) => {
  const map = useMap()
  const drawLayerRef = useRef<L.FeatureGroup | null>(null)

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const onEdit = useCallback(
    async (featureCollection) => {
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

      const bbox = getBbox(featureCollection)

      // Convert FeatureCollection to GeometryCollection for the PostGIS geometry column
      const geometryCollection = {
        type: 'GeometryCollection',
        geometries: featureCollection.features
          .map((f) => f.geometry)
          .filter(Boolean),
      }

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
        table: tableName,
        rowIdName: activeIdName,
        rowId: activeId,
        operation: 'update',
        draft: { geometry: geometryCollection, bbox },
        prev: { ...row },
      })
    },
    [addOperation, db, editingAction, editingCheck, editingPlace],
  )

  useEffect(() => {
    // Remove any previously persisted draw layer (from a prior entity or session)
    if (_persistentDrawLayer && map.hasLayer(_persistentDrawLayer)) {
      map.removeLayer(_persistentDrawLayer)
    }

    const drawLayer = new L.FeatureGroup()
    map.addLayer(drawLayer)
    _persistentDrawLayer = drawLayer
    drawLayerRef.current = drawLayer

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
        const geometry = result?.rows?.[0]?.geometry
        if (geometry && drawLayer) {
          try {
            L.geoJSON(geometry, {
              pointToLayer: (_feature, latlng) =>
                L.circleMarker(latlng, EDITING_STYLE),
            }).eachLayer((layer) => {
              applyEditingStyle(layer)
              drawLayer.addLayer(layer)
            })
          } catch {
            // ignore invalid geometry
          }
        }
      })
    }

    const drawControlFull = new L.Control.Draw({
      draw: {
        marker: true,
        polyline: true,
        circle: true,
        circlemarker: false,
        rectangle: { showArea: false },
      },
      edit: {
        featureGroup: drawLayer,
      },
    })
    map.addControl(drawControlFull)

    return () => {
      // Keep drawLayer on the map so drawn geometry stays visible after
      // drawing mode is deactivated. It will be removed on the next mount.
      // Revert orange editing style back to default.
      drawLayer.eachLayer(revertEditingStyle)
      map.removeControl(drawControlFull)
      map.getContainer().classList.remove('leaflet-draw-active')
    }
  }, [map, onEdit, db, editingPlace, editingCheck, editingAction])

  // During any leaflet-draw action (draw, edit, delete) add a CSS class so
  // pointer-events on overlayPane SVG paths are suppressed — this lets the
  // leaflet-draw _mouseMarker capture vertex clicks for polygon/line drawing
  // and prevents the hand cursor from interfering during edit/delete.
  // useMapEvents auto-removes these listeners when the component unmounts.
  useMapEvents({
    'draw:drawstart': () =>
      map.getContainer().classList.add('leaflet-draw-active'),
    'draw:drawstop': () =>
      map.getContainer().classList.remove('leaflet-draw-active'),
    'draw:editstart': () =>
      map.getContainer().classList.add('leaflet-draw-active'),
    'draw:editstop': () =>
      map.getContainer().classList.remove('leaflet-draw-active'),
    'draw:deletestart': () =>
      map.getContainer().classList.add('leaflet-draw-active'),
    'draw:deletestop': () =>
      map.getContainer().classList.remove('leaflet-draw-active'),
    'draw:created': (e) => {
      let layer = (e as unknown as L.DrawEvents.Created).layer
      // L.Marker doesn't support setStyle; replace with a circleMarker so
      // the orange edit style (and its revert) works uniformly for all types.
      if (layer instanceof L.Marker) {
        layer = L.circleMarker(layer.getLatLng(), EDITING_STYLE)
      } else {
        applyEditingStyle(layer)
      }
      drawLayerRef.current?.addLayer(layer)
      onEdit(drawLayerRef.current?.toGeoJSON())
    },
    'draw:edited': () => onEdit(drawLayerRef.current?.toGeoJSON()),
    'draw:deleted': () => onEdit(drawLayerRef.current?.toGeoJSON()),
  } as L.LeafletEventHandlerFnMap)

  return null
}
