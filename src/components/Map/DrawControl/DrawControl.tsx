import { useEffect, useCallback } from 'react'
import 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useMap } from 'react-leaflet'
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

// TODO: useMapEvents
export const DrawControlComponent = ({
  editingPlace,
  editingCheck,
  editingAction,
}) => {
  const map = useMap()

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

      // query previous geometry for the operation log
      const prevRes = await db.query(
        `SELECT geometry, bbox FROM ${tableName} WHERE ${activeIdName} = $1`,
        [activeId],
      )
      const row = prevRes?.rows?.[0] ?? {}

      db.query(
        `UPDATE ${tableName} SET geometry = $1, bbox = $2 WHERE ${activeIdName} = $3`,
        [featureCollection, bbox, activeId],
      )
      addOperation({
        table: tableName,
        rowIdName: activeIdName,
        rowId: activeId,
        operation: 'update',
        draft: { geometry: featureCollection, bbox },
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
      db.query(`SELECT geometry FROM ${tableName} WHERE ${activeIdName} = $1`, [
        activeId,
      ]).then((result) => {
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
        // activating the rectangle drawing tool seems o.k. (cursor changes to +).
        // but after a click what seems to be a single or maybe double point has been drawn and a popup next to the cursor says 'Release mouse to finish drawing'.
        // There is an error: Uncaught ReferenceError: type is not defined
        // This is a known leaflet-draw bug where the rectangle's tooltip calls readableArea which references an undefined type variable.
        // The fix is to disable the area display on the rectangle tooltip with showArea: false.
        rectangle: { showArea: false },
      },
      edit: {
        featureGroup: drawLayer,
      },
    })
    map.addControl(drawControlFull)

    const onDrawCreated = (e) => {
      let layer = e.layer
      // L.Marker doesn't support setStyle; replace with a circleMarker so
      // the orange edit style (and its revert) works uniformly for all types.
      if (layer instanceof L.Marker) {
        layer = L.circleMarker(layer.getLatLng(), EDITING_STYLE)
      } else {
        applyEditingStyle(layer)
      }
      drawLayer.addLayer(layer)
      onEdit(drawLayer.toGeoJSON())
    }
    map.on('draw:created', onDrawCreated)

    const onDrawEdited = () => onEdit(drawLayer.toGeoJSON())
    map.on('draw:edited', onDrawEdited)

    const onDrawDeleted = () => onEdit(drawLayer.toGeoJSON())
    map.on('draw:deleted', onDrawDeleted)

    return () => {
      // Keep drawLayer on the map so drawn geometry stays visible after
      // drawing mode is deactivated. It will be removed on the next mount.
      // Revert orange editing style back to default.
      drawLayer.eachLayer(revertEditingStyle)
      map.removeControl(drawControlFull)
      map.off('draw:created', onDrawCreated)
      map.off('draw:edited', onDrawEdited)
      map.off('draw:deleted', onDrawDeleted)
    }
  }, [map, onEdit, db, editingPlace, editingCheck, editingAction])

  return null
}
