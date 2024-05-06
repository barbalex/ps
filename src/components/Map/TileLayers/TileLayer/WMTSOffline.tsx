import { useEffect, useContext } from 'react'
import { useMap } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../generated/client/index.ts'
import storeContext from '../../../../storeContext'
import { IStore } from '../../../../store'
import { useElectric } from '../../../../ElectricProvider.tsx'
import { createNotification } from '../../../../modules/createRows.ts'

interface Props {
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
    // TODO: get app_state_id, then activate
    // db.app_states.update({
    //   where: { app_state_id },
    //   data: {
    //     show_local_map: {
    //       [layer.id]: {
    //         show: true,
    //       },
    //     },
    //   },
    // })

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
    store,
  ])

  return null
}
