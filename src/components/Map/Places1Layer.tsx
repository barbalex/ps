/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useState } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import { useLiveQuery } from 'electric-sql/react'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'

import { vectorLayerDisplayToProperties } from '../../modules/vectorLayerDisplayToProperties'
import { Popup } from './Popup'
import { useElectric } from '../../ElectricProvider'
import {
  Vector_layer_displays as VectorLayerDisplay,
  Places as Place,
} from '../../../generated/client'

// TODO: query ui_options.show_place1_layer in parent
// and render this component accordingly to prevent querying all places here
export const Places1Layer = () => {
  const { db } = useElectric()!

  const { results: vectorLayerDisplayResults } = useLiveQuery(
    db.vector_layer_displays.liveFirst({ where: { data_table: 'places1' } }),
  )
  const display: VectorLayerDisplay = vectorLayerDisplayResults

  console.log('hello Places1Layer, display:', display)

  // TODO: query only inside current map bounds using places.bbox
  const { results: placesResults = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null, geometry: { not: null } } }),
  )
  const places: Place[] = placesResults

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = places.map((p) => {
    // need to add p's properties to all features:
    // somehow there is a data property with empty object as value???
    const { geometry: geom, bbox, data, ...placeProperties } = p
    const geometry = { ...p.geometry }
    geometry.features.forEach((f) => {
      f.properties = placeProperties ?? {}
    })
    return p.geometry
  })
  console.log('hello Places1Layer, data:', data)

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  // TODO: fetch data from places and vector_layer_displays

  // include only if zoom between min_zoom and max_zoom
  if (!display) return null
  if (display?.min_zoom !== undefined && zoom < display?.min_zoom) return null
  if (display?.max_zoom !== undefined && zoom > display?.max_zoom) return null
  if (!data?.length) return null

  const mapSize = map.getSize()
  return (
    <GeoJSON
      key={`${data?.length ?? 0}/${JSON.stringify(display)}`}
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
            label: feature.label,
            // TODO: choose what properties to show
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
