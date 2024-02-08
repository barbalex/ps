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

type Props = {
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

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  // TODO: fetch data from places and vector_layer_displays

  // include only if zoom between min_zoom and max_zoom
  if (display.min_zoom !== undefined && zoom < display.min_zoom) return null
  if (display.max_zoom !== undefined && zoom > display.max_zoom) return null

  const mapSize = map.getSize()

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  const geometry = {
    type: 'FeatureCollection',
    features: [],
  }

  return (
    <GeoJSON
      key={`${data?.length ?? 0}/${JSON.stringify(display)}`}
      data={data}
      opacity={
        // TODO: what is this for?
        display.opacity_percent ? display.opacity_percent / 100 : 1
      }
      // TODO: style by properties, use a function that receives the feature: https://stackoverflow.com/a/66106512/712005
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
  )
}
