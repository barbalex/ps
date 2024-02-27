/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import { MdClose } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import { uuidv7 } from '@kripod/uuidv7'
import * as icons from 'react-icons/md'

import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components'

import { vectorLayerDisplayToProperties } from '../../../modules/vectorLayerDisplayToProperties'
import { Popup } from '../Popup'
import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
  Ui_options as UiOption,
} from '../../../generated/client'
import { user_id } from '../../SqlInitializer'

const xmlViewerStyle = {
  fontSize: 'small',
}
const dialogContentStyle = {
  paddingTop: 0,
}

const xmlTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

interface Props {
  layer: VectorLayer
  display: VectorLayerDisplay
}
export const VectorLayerWFS = ({ layer, display }: Props) => {
  const { db } = useElectric()!
  const [error, setError] = useState()
  const notificationIds = useRef([])

  const { results: uiOptionResults } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = uiOptionResults
  // const showMap = uiOption?.show_map ?? false TODO:
  const showMap = uiOption?.show_map ?? true

  const removeNotifs = useCallback(async () => {
    await db.notifications.deleteMany({
      where: { notification_id: { in: notificationIds.current } },
    })
    notificationIds.current = []
  }, [db.notifications])

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  const [data, setData] = useState()
  const fetchData = useCallback(
    async (/*{ bounds }*/) => {
      if (!showMap) return

      // const mapSize = map.getSize()
      removeNotifs()
      const notification_id = uuidv7()
      await db.notifications.create({
        data: {
          notification_id,
          title: `Lade Vektor-Karte '${layer.label}'...`,
          intent: 'info',
          timeout: 100000,
        },
      })
      notificationIds.current = [notification_id, ...notificationIds.current]
      let res
      const params = {
        service: 'WFS',
        version: layer.wfs_version,
        request: 'GetFeature',
        typeName: layer.wfs_layer?.value,
        srsName: 'EPSG:4326',
        outputFormat: layer.wfs_output_format?.value,
        maxfeatures: 1000,
        // bbox is NOT WORKING
        // always returning 0 features...
        // bbox: `${bounds.toBBoxString()},EPSG:4326`,
        // bbox: bounds.toBBoxString(),
        // width: mapSize.x,
        // height: mapSize.y,
      }
      try {
        res = await axios({
          method: 'get',
          url: layer.wfs_url,
          params,
        })
      } catch (error) {
        await db.notifications.delete({
          where: { notification_id },
        })
        console.error('VectorLayerWFS, error:', {
          url: error?.url,
          error,
          status: error?.status,
          statusText: error?.statusText,
          data: error?.data,
          type: error?.type,
        })
        setError(error.data)
        return await db.notifications.create({
          data: {
            notification_id: uuidv7(),
            title: `Fehler beim Laden der Geometrien für ${layer.label}`,
            body: error.message,
            intent: 'error',
          },
        })
      }
      removeNotifs()
      setData(res.data?.features)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layer.label,
      layer.wfs_layer,
      layer.wfs_output_format,
      layer.wfs_url,
      layer.wfs_version,
      removeNotifs,
      showMap,
    ],
  )

  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)
  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() })
  }, [fetchDataDebounced, map, showMap])

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  removeNotifs()
  if (
    data?.length >= (layer.max_features ?? 1000) &&
    !notificationIds.current.length
  ) {
    const notification_id = uuidv7()
    db.notifications.create({
      data: {
        notification_id,
        title: `Zuviele Geometrien`,
        body: `Die maximale Anzahl Features von ${
          layer.max_features ?? 1000
        } für Vektor-Karte '${
          layer.label
        }' wurde geladen. Zoomen sie näher ran`,
        intent: 'warning',
        timeout: 10000,
      },
    })
    notificationIds.current = [notification_id, ...notificationIds.current]
  }

  const mapSize = map.getSize()

  // console.log('hello VectorLayerWFS, data:', data)

  return (
    <>
      <GeoJSON
        key={`${data?.length ?? 0}/${JSON.stringify(display)}`}
        data={data}
        opacity={
          // TODO: what is this for?
          display.opacity_percent ? display.opacity_percent / 100 : 1
        }
        style={vectorLayerDisplayToProperties({ vectorLayerDisplay: display })}
        pointToLayer={(geoJsonPoint, latlng) => {
          if (display.marker_type === 'circle') {
            return L.circleMarker(latlng, {
              ...display,
              radius: display.circle_marker_radius ?? 8,
            })
          }

          const IconComponent = icons[display?.marker_symbol]

          return IconComponent
            ? L.marker(latlng, {
                icon: L.divIcon({
                  html: ReactDOMServer.renderToString(
                    <IconComponent
                      style={{
                        color: display.color ?? '#cc756b',
                        fontSize: display.marker_size ?? 16,
                      }}
                    />,
                  ),
                }),
              })
            : L.marker(latlng)
        }}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(feature?.properties ?? {}),
            },
          ]
          const popupContent = ReactDOMServer.renderToString(
            <Popup layersData={layersData} mapSize={mapSize} />,
          )
          _layer.bindPopup(popupContent)
        }}
      />
      <Dialog onOpenChange={() => setError(null)} open={!!error}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Error fetching data for vector layer</DialogTitle>
            <DialogContent style={dialogContentStyle}>
              <XMLViewer style={xmlViewerStyle} xml={error} theme={xmlTheme} />
            </DialogContent>
            <DialogActions>
              <Button
                aria-label="close"
                title="close"
                onClick={() => setError(null)}
                icon={<MdClose />}
              />
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
