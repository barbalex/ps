/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import { useLiveQuery } from 'electric-sql/react'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'

import { vectorLayerDisplayToProperties } from '../../../modules/vectorLayerDisplayToProperties'
import { Popup } from '../Popup'
import { useElectric } from '../../../ElectricProvider'
import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client'
import { createVectorLayerDisplay } from '../../../modules/createRows'

// TODO: query ui_options.show_place1_layer in parent
// and render this component accordingly to prevent querying all places here
export const Places1Layer = () => {
  const { db } = useElectric()!

  const { results: vectorLayerDisplayResults } = useLiveQuery(
    db.vector_layer_displays.liveFirst({ where: { data_table: 'places1' } }),
  )
  const display: VectorLayerDisplay = vectorLayerDisplayResults

  console.log('hello Places1Layer, row:', display)

  const isFirstRender = useRef(true)
  // ensure new vectorLayerDisplay is created if needed
  useEffect(() => {
    const run = async () => {
      // this should NOT run on first render as row is null then anyway
      if (isFirstRender.current) {
        isFirstRender.current = false
        return
      }
      // stop if row already exists
      if (display) return
      const newVLD = createVectorLayerDisplay({ data_table: 'places1' })
      db.vector_layer_displays.create({ data: newVLD })
    }
    run()
  }, [db.vector_layer_displays, display])

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = []
  // const geometry = {
  //   type: 'FeatureCollection',
  //   features: [],
  // }

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  // TODO: fetch data from places and vector_layer_displays

  // include only if zoom between min_zoom and max_zoom
  if (display.min_zoom !== undefined && zoom < display.min_zoom) return null
  if (display.max_zoom !== undefined && zoom > display.max_zoom) return null

  const mapSize = map.getSize()
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
