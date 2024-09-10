// TODO: not in use
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useAtom, useSetAtom } from 'jotai'

import { Wms_layers as WmsLayerType } from '../../../../generated/client/index.ts'
import { useElectric } from '../../../../ElectricProvider.tsx'
import { createNotification } from '../../../../modules/createRows.ts'
import { showLocalMapAtom, localMapValuesAtom } from '../../../../store.ts'

interface Props {
  layer: WmsLayerType
}

export const WMTSOffline = ({ layer }: Props) => {
  const [showLocalMap, setShowLocalMap] = useAtom(showLocalMapAtom)
  const setLocalMapValues = useSetAtom(localMapValuesAtom)
  const map = useMap()

  const { db } = useElectric()!

  console.log('WMTSOffline, layer:', layer)

  useEffect(() => {
    const wmtsLayer = L.tileLayer.offline(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layer.min_zoom,
      maxZoom: layer.max_zoom,
      className: layer.grayscale ? 'grayscale' : '',
      opacity: layer.opacity,
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
        const data = createNotification({
          title: `Fehler beim Speichern der Karten für ${layer.label}`,
          body: error.message,
          intent: 'error',
        })
        db.notifications.create({ data })
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
    db.notifications,
    db.app_states,
    layer,
    layer.grayscale,
    layer.id,
    layer.label,
    layer.max_zoom,
    layer.min_zoom,
    layer.opacity,
    layer.wmts_url_template,
    map,
    setLocalMapValues,
    setShowLocalMap,
    showLocalMap,
  ])

  return null
}
