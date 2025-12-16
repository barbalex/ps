// TODO: not in use
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  showLocalMapAtom,
  localMapValuesAtom,
  addNotificationAtom,
} from '../../../../store.ts'

export const WMTSOffline = ({ layer }) => {
  const [showLocalMap, setShowLocalMap] = useAtom(showLocalMapAtom)
  const setLocalMapValues = useSetAtom(localMapValuesAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const map = useMap()
  const layerPresentation = layer.layer_presentations?.[0]

  const db = usePGlite()

  console.log('WMTSOffline, layer:', layer)

  useEffect(() => {
    const wmtsLayer = L.tileLayer.offline(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layerPresentation.min_zoom,
      maxZoom: layerPresentation.max_zoom,
      className: layerPresentation.grayscale ? 'grayscale' : '',
      opacity: layerPresentation.opacity_percent
        ? layerPresentation.opacity_percent / 100
        : 0,
    })
    wmtsLayer.addTo(map)
    const control = L.control.savetiles(wmtsLayer, {
      confirmSave: (status, saveCallback) => saveCallback(layer.id),
    })
    control.addTo(map)
    control.openDB()

    const save = () => {
      try {
        control.saveMap({ layer, map })
      } catch (error) {
        addNotification({
          title: `Fehler beim Speichern der Karten für ${layer.label}`,
          body: error.message,
          intent: 'error',
        })
      }
    }
    const del = () => control.deleteTable(layer.id)

    setLocalMapValues({ id: layer.id, save, del })
    setShowLocalMap({ ...showLocalMap, [layer.id]: { show: true } })

    return () => {
      map.removeLayer(wmtsLayer)
      map.removeControl(control)
    }
  }, [
    db,
    layer,
    layer.grayscale,
    layer.id,
    layer.label,
    layer.max_zoom,
    layer.min_zoom,
    layer.opacity,
    layer.wmts_url_template,
    layerPresentation.grayscale,
    layerPresentation.max_zoom,
    layerPresentation.min_zoom,
    layerPresentation.opacity_percent,
    map,
    setLocalMapValues,
    setShowLocalMap,
    showLocalMap,
  ])

  return null
}
