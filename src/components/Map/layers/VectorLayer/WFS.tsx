/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import * as L from 'leaflet'
import XMLViewer from 'react-xml-viewer'
import { MdClose } from 'react-icons/md'
import { useDebouncedCallback } from 'use-debounce'
import proj4 from 'proj4'
import reproject from 'reproject'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { ProgressiveGeoJSON } from '../ProgressiveGeoJSON.tsx'
import { cachedMarkerIconHtml } from '../markerIconHtml.tsx'

import type Crs from '../../../../models/public/Crs.ts'
import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'
import type VectorLayerDisplays from '../../../../models/public/VectorLayerDisplays.ts'

import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} = fluentUiReactComponents

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { setShortTermOnlineFromFetchError } from '../../../../modules/setShortTermOnlineFromFetchError.ts'
import { httpGet } from '../../../../modules/httpGet.ts'
import {
  addNotificationAtom,
  removeNotificationAtom,
} from '../../../../store.ts'
import styles from './WFS.module.css'

const xmlTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

type Bbox = { minX: number; minY: number; maxX: number; maxY: number }

const bboxFromBounds = ({
  bounds,
  defaultCrs,
}: {
  bounds: L.LatLngBounds
  defaultCrs?: Crs | undefined
}): Bbox => {
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  const usesDefaultCrs = !!defaultCrs && defaultCrs.code !== 'EPSG:4326'

  const [swX, swY] =
    usesDefaultCrs && defaultCrs ?
      proj4('EPSG:4326', defaultCrs.proj4!, [sw.lng, sw.lat])
    : [sw.lng, sw.lat]
  const [neX, neY] =
    usesDefaultCrs && defaultCrs ?
      proj4('EPSG:4326', defaultCrs.proj4!, [ne.lng, ne.lat])
    : [ne.lng, ne.lat]

  const minX = Math.min(swX, neX)
  const maxX = Math.max(swX, neX)
  const minY = Math.min(swY, neY)
  const maxY = Math.max(swY, neY)

  // 10 % padding: pans that stay inside the padded window need no refetch
  const padX = (maxX - minX) * 0.1
  const padY = (maxY - minY) * 0.1

  return {
    minX: minX - padX,
    minY: minY - padY,
    maxX: maxX + padX,
    maxY: maxY + padY,
  }
}

const bboxToString = (bbox: Bbox) =>
  `${bbox.minX},${bbox.minY},${bbox.maxX},${bbox.maxY}`

type WfsService = {
  url: string
  version: string | null
  info_format: string | null
  default_crs: string | null
}

type Props = {
  layer: VectorLayers & {
    label?: string | null
    wfs_services?: WfsService
    vector_layer_displays?: VectorLayerDisplays[] | null
  }
  layerPresentation: LayerPresentations
}

export const WFS = ({ layer, layerPresentation }: Props) => {
  const addNotification = useSetAtom(addNotificationAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)

  const db = usePGlite()
  const [error, setError] = useState<string | null | undefined>(undefined)
  const notificationIds = useRef<string[]>([])

  const display = layer.vector_layer_displays?.[0]
  const wfsService = layer.wfs_services!

  const removeNotifs = useCallback(() => {
    for (const id of notificationIds.current) {
      removeNotification(id)
    }
    notificationIds.current = []
  }, [removeNotification])

  const map = useMap()
  // default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
  // extract the relevant parts for db.crs.code:
  const wfsDefaultCrsArray = wfsService.default_crs?.split(':').slice(-3)
  const wfsDefaultCrsCode =
    wfsDefaultCrsArray?.length === 3 ?
      [wfsDefaultCrsArray[0], wfsDefaultCrsArray[2]].join(':')
    : 'EPSG:4326'

  const [zoom, setZoom] = useState(map.getZoom())
  const [lastBbox, setLastBbox] = useState<string | null>(null)
  // the padded bbox and zoom of the last successful fetch — used to skip
  // refetches when the viewport only moved within the fetched window
  const lastFetchRef = useRef<{ bbox: Bbox; zoom: number } | null>(null)

  const [data, setData] = useState<
    GeoJSON.FeatureCollection | null | undefined
  >(undefined)
  const fetchData = useCallback(
    async () => {
      const resCrs = await db.query(`SELECT * FROM crs WHERE code = $1`, [
        wfsDefaultCrsCode,
      ])
      const defaultCrs = resCrs?.rows?.[0] as Crs | undefined
      removeNotifs()
      const bbox = bboxFromBounds({ bounds: map.getBounds(), defaultCrs })
      const fetchZoom = map.getZoom()
      const notificationId = (await addNotification({
        title: `Lade Vektor-Karte '${layer.label}'...`,
        intent: 'info',
        timeout: 100000,
      } as Parameters<typeof addNotification>[0])) as string
      notificationIds.current = [notificationId, ...notificationIds.current]
      let res
      const outputFormat =
        wfsService.info_format?.toLowerCase?.().includes('json') ?
          wfsService.info_format
        : 'application/json'
      const params = {
        service: 'WFS',
        version: wfsService.version,
        request: 'GetFeature',
        typeName: layer.wfs_service_layer_name,
        srsName: wfsDefaultCrsCode ?? 'EPSG:4326',
        outputFormat,
        // seems that bbox expects the layers default crs
        // if not, returns 0 features
        bbox: bboxToString(bbox),
      }
      try {
        res = await httpGet(wfsService.url, params)
      } catch (error) {
        // the request failed on the network level
        setShortTermOnlineFromFetchError(error)
        removeNotification(notificationId)
        console.error('VectorLayerWFS, network error:', {
          url: wfsService.url,
          error,
        })
        setError(undefined)
        return addNotification({
          title: `Fehler beim Laden der Geometrien für ${layer.label}`,
          body: (error as Error).message,
          intent: 'error',
        })
      }
      if (!res.ok) {
        // the server responded with a status code that falls out of the range of 2xx
        removeNotification(notificationId)
        console.error('VectorLayerWFS, error:', {
          url: res.url,
          status: res.status,
          statusText: res.statusText,
          data: res.data,
        })
        // only strings can be rendered in the error dialog
        setError(typeof res.data === 'string' ? res.data : null)
        return addNotification({
          title: `Fehler beim Laden der Geometrien für ${layer.label}`,
          body: `${res.status} ${res.statusText}`,
          intent: 'error',
        })
      }
      removeNotifs()
      // remember the fetched window only after success — a failed fetch
      // must retry on the next viewport change
      lastFetchRef.current = { bbox, zoom: fetchZoom }
      setLastBbox(bboxToString(bbox))
      // ISSUE: The only way querying by bbox seems to work is by using the layers default crs
      // BUT: the server returns the data in the layer's default crs too...
      // SOLUTION: reproject the data to EPSG:4326
      // console.log('VectorLayerWFS, fetchData', {
      //   data: res.data,
      //   defaultCrs,
      //   wfsDefaultCrsCode,
      // })
      const sourceData = res?.data as
        | (GeoJSON.FeatureCollection & {
            crs?: { properties?: { name?: string } } | null
          })
        | undefined
      const dataToProject = sourceData?.features ? sourceData : null
      const responseCrsName = sourceData?.crs?.properties?.name
      const responseEpsg =
        responseCrsName?.includes('EPSG') ?
          `EPSG:${responseCrsName.split(':').at(-1)}`
        : null
      const sourceCrsCode = responseEpsg ?? wfsDefaultCrsCode
      const sourceCrsRes =
        sourceCrsCode ?
          await db.query(`SELECT * FROM crs WHERE code = $1`, [sourceCrsCode])
        : null
      const sourceCrs =
        (sourceCrsRes?.rows?.[0] as Crs | undefined) ?? defaultCrs

      const reprojectedData =
        dataToProject && sourceCrs?.proj4 && sourceCrsCode !== 'EPSG:4326' ?
          reproject.reproject(
            dataToProject,
            sourceCrs.proj4,
            '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
          )
        : dataToProject

      setData(
        (reprojectedData ??
          sourceData ??
          null) as GeoJSON.FeatureCollection | null,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      addNotification,
      db,
      layer.label,
      layer.max_features,
      layer.wfs_service_layer_name,
      map,
      removeNotifs,
      wfsDefaultCrsCode,
      wfsService.info_format,
      wfsService.url,
      wfsService.version,
    ],
  )

  // refetch on viewport changes, debounced; skipped when the new viewport
  // lies within the padded bbox of the last fetch at the same zoom (pans
  // within the fetched window need no new request; zoom changes always
  // refetch because of server-side feature limits)
  const fetchIfViewportLeftWindow = useDebouncedCallback(() => {
    const last = lastFetchRef.current
    if (last && last.zoom === map.getZoom()) {
      const b = map.getBounds()
      const ne = b.getNorthEast()
      const sw = b.getSouthWest()
      // compare in 4326 — containment is checked against a fetch window in
      // the same projection only when no reprojected crs is in play; with a
      // projected crs a lat/lng check is a safe approximation for the small
      // padding involved (and simply triggers a refetch when unsure)
      if (
        sw.lng >= last.bbox.minX &&
        sw.lat >= last.bbox.minY &&
        ne.lng <= last.bbox.maxX &&
        ne.lat <= last.bbox.maxY
      ) {
        return
      }
    }
    fetchData()
  }, 600)

  // moveend covers pans, drags and zooms (leaflet fires it after zoomend)
  useMapEvents({
    moveend: () => fetchIfViewportLeftWindow(),
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // notif cleanup after commit — writing atoms during render is a side
  // effect (and re-ran on every render)
  useEffect(() => {
    removeNotifs()
  }, [removeNotifs, data])

  // include only if zoom between min_zoom and max_zoom
  if (
    layerPresentation.min_zoom !== undefined &&
    zoom < layerPresentation.min_zoom!
  ) {
    return null
  }
  if (
    layerPresentation.max_zoom !== undefined &&
    zoom > layerPresentation.max_zoom!
  ) {
    return null
  }
  if (!display) {
    console.error('VectorLayerWFS, no display:', { layer, display })
    return null
  }

  // TODO: await not possible here
  // if (
  //   data?.length + 1 >=
  //   (layer.max_features ?? 1000)
  //   // && !notificationIds.current.length
  // ) {
  //   const notif2Res = await createNotification({
  //     title: `Zuviele Geometrien`,
  //     body: `Die maximale Anzahl Features von ${
  //       layer.max_features ?? 1000
  //     } für Vektor-Karte '${
  //       layer.label
  //     }' wurde geladen. Zoomen sie näher ran, damit alle Features geladen werden können.`,
  //     intent: 'warning',
  //     timeout: 10000,
  //     db,
  //   })
  //   const notif2 = notif2Res?.rows?.[0]
  //   notificationIds.current = [
  //     notif2.id,
  //     ...notificationIds.current,
  //   ]
  // }

  if (!data?.features?.length) {
    // console.log('VectorLayerWFS, no data, thus returning null')
    return null
  }

  return (
    <>
      <ProgressiveGeoJSON
        resetKey={`${lastBbox ?? ''}/${data?.features?.length ?? 0}/${JSON.stringify(display)}/${JSON.stringify(
          layerPresentation,
        )}`}
        data={data}
        geomanIgnore={true}
        onEachFeature={(feature, geoLayer) => {
          ;(
            geoLayer as L.Layer & { vectorLayerLabel?: string }
          ).vectorLayerLabel = layer.label || 'WFS Layer'
          feature.properties = feature.properties ?? {}
          feature.properties.label = 'Feature'
        }}
        style={vectorLayerDisplayToProperties({
          vectorLayerDisplay: display,
          presentation: layerPresentation,
        })}
        pointToLayer={(_geoJsonPoint, latlng) => {
          if (display.marker_type === 'circle') {
            return new L.CircleMarker(latlng, {
              ...(display as unknown as L.CircleMarkerOptions),
              geomanIgnore: true,
              radius: display.circle_marker_radius ?? 8,
            })
          }

          const markerIconStyle = {
            '--marker-color': display.color ?? '#cc756b',
            '--marker-size': `${display.marker_size ?? 16}px`,
          } as React.CSSProperties
          const html = cachedMarkerIconHtml({
            symbol: display.marker_symbol,
            className: `${styles.markerIcon} ${styles.markerIconSized}`,
            style: markerIconStyle,
          })

          return html ?
              new L.Marker(latlng, {
                geomanIgnore: true,
                icon: new L.DivIcon({ html }),
              })
            : new L.Marker(latlng, { geomanIgnore: true })
        }}
      />
      <Dialog
        onOpenChange={() => setError(null)}
        open={!!error}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Error fetching data for vector layer</DialogTitle>
            <DialogContent className={styles.dialogContent}>
              <div className={styles.xmlViewer}>
                <XMLViewer
                  xml={error as string}
                  theme={xmlTheme}
                />
              </div>
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
