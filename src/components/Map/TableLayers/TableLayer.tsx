import { useState, memo } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { vectorLayerDisplayToProperties } from '../../../modules/vectorLayerDisplayToProperties'
import { Popup } from '../Popup'
import {
  Vector_layer_displays as VectorLayerDisplay,
  vector_layers as VectorLayer,
  Places as Place,
  Actions as Action,
  Checks as Check,
  Observations as Observation,
} from '../../../generated/client'
import { useElectric } from '../../../ElectricProvider'

type Props = {
  data: Place[] | Action[] | Check[] | Observation[]
  layer: VectorLayer
}

export const TableLayer = memo(({ data, layer }: Props) => {
  const { db } = useElectric()!
  const { results: vectorLayerDisplayResults = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id: layer.vector_layer_id },
    }),
  )
  // TODO: adapt to multiple vector_layer_displays
  const display: VectorLayerDisplay = vectorLayerDisplayResults[0]

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  if (!display) return null
  if (!layer) return null
  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null
  if (!data?.length) return null

  const mapSize = map.getSize()

  // return null

  return (
    <GeoJSON
      key={`${data.length ?? 0}/${JSON.stringify(display)}`}
      data={data}
      // TODO: style by properties, use a function that receives the feature: https://stackoverflow.com/a/66106512/712005
      style={vectorLayerDisplayToProperties({ vectorLayerDisplay: display })}
      pointToLayer={(geoJsonPoint, latlng) => {
        if (display.marker_type === 'circle') {
          return L.circleMarker(latlng, {
            ...display,
            radius: display.circle_marker_radius ?? 8,
          })
        }

        const IconComponent = icons[display.marker_symbol]

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
            label: feature.label,
            properties: Object.entries(feature?.properties ?? {}).map(
              ([key, value]) => {
                // if value is a date, format it
                // the date object blows up
                if (value instanceof Date) {
                  return [key, value.toLocaleString('de-CH')]
                }
                return [key, value]
              },
            ),
          },
        ]
        const popupContent = ReactDOMServer.renderToString(
          <Popup layersData={layersData} mapSize={mapSize} />,
        )
        _layer.bindPopup(popupContent)
      }}
    />
  )
})
