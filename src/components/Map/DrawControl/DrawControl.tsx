import { useEffect, useCallback } from 'react'
import 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useMap } from 'react-leaflet'
import { bbox as getBbox } from '@turf/bbox'
import { usePGlite } from '@electric-sql/pglite-react'

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

  const db = usePGlite()

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

      db.query(
        `UPDATE ${tableName} SET geometry = $1, bbox = $2 WHERE ${activeIdName} = $3`,
        [featureCollection, bbox, activeId],
      )
    },
    [db, editingAction, editingCheck, editingPlace],
  )

  useEffect(() => {
    // solution to allow only one geometry to be drawn
    // see: https://github.com/Leaflet/Leaflet.draw/issues/315#issuecomment-500246272
    const drawLayer = new L.FeatureGroup()
    map.addLayer(drawLayer)
    // TODO: if row has geometry, add it
    // like this?: drawLayer.addLayer(e.layer)
    const drawControlFull = new L.Control.Draw({
      draw: {
        marker: true,
        polyline: true,
        circle: true,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawLayer,
      },
    })
    map.addControl(drawControlFull)

    const onDrawCreated = (e) => {
      drawLayer.addLayer(e.layer)
      onEdit(drawLayer.toGeoJSON())
    }
    map.on('draw:created', onDrawCreated)

    const onDrawEdited = () => onEdit(drawLayer.toGeoJSON())
    map.on('draw:edited', onDrawEdited)

    const onDrawDeleted = () => onEdit(drawLayer.toGeoJSON())
    map.on('draw:deleted', onDrawDeleted)

    return () => {
      map.removeLayer(drawLayer)
      map.removeControl(drawControlFull)
      // map.removeControl(drawControlEditOnly)
      map.off('draw:created', onDrawCreated)
      map.off('draw:edited', onDrawEdited)
      map.off('draw:deleted', onDrawDeleted)
    }
  }, [map, onEdit])

  return null
}
