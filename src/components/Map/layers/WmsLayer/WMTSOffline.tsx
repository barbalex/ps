// TODO: not in use
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  showLocalMapAtom,
  localMapValuesAtom,
  addNotificationAtom,
} from '../../../../store.ts'

type Props = {
  layer: {
    id: string
    label: string
    wmts_url_template: string
    grayscale?: boolean | null
    max_zoom?: number | null
    min_zoom?: number | null
    opacity?: number | null
    layer_presentations?:
      | {
          grayscale?: boolean | null
          min_zoom?: number
          max_zoom?: number
          opacity_percent?: number | null
        }[]
      | null
  }
}

export const WMTSOffline = ({ layer }: Props) => {
  const [showLocalMap, setShowLocalMap] = useAtom(showLocalMapAtom)
  const setLocalMapValues = useSetAtom(localMapValuesAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const map = useMap()
  const layerPresentation = layer.layer_presentations?.[0]!

  const db = usePGlite()

  console.log('WMTSOffline, layer:', layer)

  useEffect(() => {
    const wmtsLayer = (
      L.tileLayer as unknown as {
        offline: (url: string, options: L.TileLayerOptions) => L.TileLayer
      }
    ).offline(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layerPresentation.min_zoom,
      maxZoom: layerPresentation.max_zoom,
      className: layerPresentation.grayscale ? 'grayscale' : '',
      opacity: layerPresentation.opacity_percent
        ? layerPresentation.opacity_percent / 100
        : 0,
    })
    wmtsLayer.addTo(map)
    const control = (
      L.control as unknown as {
        savetiles: (
          baseLayer: L.TileLayer,
          options: {
            confirmSave: (
              _status: unknown,
              saveCallback: (layerId: string) => void,
            ) => void
          },
        ) => L.Control & {
          openDB: () => void
          saveMap: (options: {
            layer: Props['layer']
            map: L.Map
          }) => void
          deleteTable: (layerId: string) => void
        }
      }
    ).savetiles(wmtsLayer, {
      confirmSave: (_status, saveCallback) => saveCallback(layer.id),
    })
    control.addTo(map)
    control.openDB()

    const save = () => {
      try {
        control.saveMap({ layer, map })
      } catch (error) {
        addNotification({
          title: `Fehler beim Speichern der Karten für ${layer.label}`,
          body: (error as Error).message,
          intent: 'error',
        })
      }
    }
    const del = () => control.deleteTable(layer.id)

    setLocalMapValues({
      id: layer.id,
      save,
      del,
    } as unknown as Record<string, boolean>)
    setShowLocalMap({
      ...(showLocalMap as unknown as object),
      [layer.id]: { show: true },
    } as unknown as boolean)

    return () => {
      map.removeLayer(wmtsLayer)
      map.removeControl(control)
    }
  }, [
    db,
    addNotification,
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
