import { useEffect, useContext } from 'react'
import { useMap } from 'react-leaflet'
import { uuidv7 } from '@kripod/uuidv7'

import { TileLayer as TileLayerType } from '../../../../dexieClient'
import storeContext from '../../../../storeContext'
import { IStore } from '../../../../store'
import { useElectric } from '../../../../ElectricProvider'

type Props = {
  layer: TileLayerType
}

export const WMTSOffline = ({ layer }: Props) => {
  const map = useMap()
  const store: IStore = useContext(storeContext)
  const { setLocalMapValues } = store

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
        control.saveMap({ layer, store, map })
      } catch (error) {
        db.notifications.create({
          data: {
            notification_id: uuidv7(),
            title: `Fehler beim Laden der Karten für ${layer.label}`,
            body: error.message,
            intent: 'error', // 'success' | 'error' | 'warning' | 'info'
          },
        })
      }
    }
    const del = () => control.deleteTable(layer.id)

    setLocalMapValues({ id: layer.id, save, del })
    db.ui_options.update({
      where: { user_id },
      data: {
        local_map_show: {
          [layer.id]: {
            show: true,
          },
        },
      },
    })

    return () => {
      map.removeLayer(wmtsLayer)
      map.removeControl(control)
    }
  }, [
    db.notifications,
    db.ui_options,
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
    store,
  ])

  return null
}
