/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import { MdClose } from 'react-icons/md'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import proj4 from 'proj4'
import reproject from 'reproject'

import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { useElectric } from '../../../../ElectricProvider.tsx'
import {
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
  Layer_presentations as LayerPresentation,
  Wfs_services as WfsService,
} from '../../../../generated/client/index.ts'
import { createNotification } from '../../../../modules/createRows.ts'
// import { epsgFrom4326 } from '../../../modules/epsgFrom4326.ts'

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

const bboxFromBounds = ({ bounds, defaultCrs }) => {
  let bbox
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  if (!defaultCrs || !defaultCrs.code === 'EPSG:4326') {
    bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
  } else {
    const neReprojected = proj4('EPSG:4326', defaultCrs?.proj4, [
      ne.lng,
      ne.lat,
    ])
    const swReprojected = proj4('EPSG:4326', defaultCrs?.proj4, [
      sw.lng,
      sw.lat,
    ])
    bbox = `${swReprojected[0]},${swReprojected[1]},${neReprojected[0]},${neReprojected[1]}`
  }
  // console.log('VectorLayerWFS.bboxFromBounds', { bbox, bounds, defaultCrs })
  return bbox
}

interface Props {
  layer: VectorLayer
  layerPresentation: LayerPresentation
}

export const WFS = ({ layer, layerPresentation }: Props) => {
  const { db } = useElectric()!
  const [error, setError] = useState()
  const notificationIds = useRef([])

  // TODO: const layer = layerPresentation.vector_layers
  const display: VectorLayerDisplay = layer.vector_layer_displays?.[0]
  const wfsService: WfsService = layer.wfs_services

  const removeNotifs = useCallback(async () => {
    await db.notifications.deleteMany({
      where: { notification_id: { in: notificationIds.current } },
    })
    notificationIds.current = []
  }, [db.notifications])

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  // default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
  // extract the relevant parts for db.crs.code:
  const wfsDefaultCrsArray = wfsService.default_crs?.split(':').slice(-3)
  const wfsDefaultCrsCode = [wfsDefaultCrsArray[0], wfsDefaultCrsArray[2]].join(
    ':',
  )

  const [zoom, setZoom] = useState(map.getZoom())

  const [data, setData] = useState()
  const fetchData = useCallback(
    async () => {
      // const mapSize = map.getSize()
      const defaultCrs = await db.crs.findFirst({
        where: { code: wfsDefaultCrsCode },
      })
      removeNotifs()
      const bbox = bboxFromBounds({ bounds: map.getBounds(), defaultCrs })
      const data = createNotification({
        title: `Lade Vektor-Karte '${layer.label}'...`,
        intent: 'info',
        timeout: 100000,
      })
      await db.notifications.create({ data })
      notificationIds.current = [
        data.notification_id,
        ...notificationIds.current,
      ]
      let res
      const params = {
        service: 'WFS',
        version: wfsService.version,
        request: 'GetFeature',
        typeName: layer.wfs_service_layer_name,
        srsName: wfsDefaultCrsCode ?? 'EPSG:4326',
        outputFormat: wfsService.info_format,
        maxfeatures: layer.max_features ? layer.max_features : 1001,
        // seems that bbox expects the layers default crs
        // if not, returns 0 features
        bbox,
      }
      try {
        res = await axios({
          method: 'get',
          url: wfsService.url,
          params,
        })
      } catch (error) {
        await db.notifications.delete({
          where: { notification_id: data.notification_id },
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
          data: createNotification({
            title: `Fehler beim Laden der Geometrien für ${layer.label}`,
            body: error.message,
            intent: 'error',
          }),
        })
      }
      removeNotifs()
      // ISSUE: The only way querying by bbox seems to work is by using the layers default crs
      // BUT: the server returns the data in the layer's default crs too...
      // SOLUTION: reproject the data to EPSG:4326
      const reprojectedData = reproject.reproject(
        res.data,
        defaultCrs?.proj4,
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
      )
      setData(reprojectedData.features)
      // console.log('VectorLayerWFS.fetchData, params:', params)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layer.label,
      layer.wfs_service_layer_name,
      wfsService.info_format,
      wfsService.url,
      wfsService.version,
      removeNotifs,
    ],
  )
  useMapEvent('dragend zoomend', fetchData)

  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)
  useEffect(() => {
    fetchDataDebounced()
  }, [fetchDataDebounced])

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) {
    console.log('VectorLayerWFS, zoom < layer.min_zoom:', { layer, zoom })
    return null
  }
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) {
    console.log('VectorLayerWFS, zoom > layer.max_zoom:', { layer, zoom })
    return null
  }
  if (!display) {
    console.error('VectorLayerWFS, no display:', { layer, display })
    return null
  }

  removeNotifs()
  if (
    data?.length + 1 >=
    (layer.max_features ?? 1000)
    // && !notificationIds.current.length
  ) {
    const data = createNotification({
      title: `Zuviele Geometrien`,
      body: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte '${
        layer.label
      }' wurde geladen. Zoomen sie näher ran, damit alle Features geladen werden können.`,
      intent: 'warning',
      timeout: 10000,
    })
    db.notifications.create({ data })
    notificationIds.current = [data.notification_id, ...notificationIds.current]
  }

  if (!data) {
    console.log('VectorLayerWFS, no data, thus returning null')
    return null
  }

  console.log('VectorLayerWFS, data.length:', data?.length)

  return (
    <>
      <GeoJSON
        key={`${data?.length ?? 0}/${JSON.stringify(display)}/${JSON.stringify(
          layerPresentation,
        )}`}
        data={data}
        style={vectorLayerDisplayToProperties({
          vectorLayerDisplay: display,
          presentation: layerPresentation,
        })}
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
