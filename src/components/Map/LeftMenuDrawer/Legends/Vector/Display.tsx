import { memo } from 'react'
import { MapContainer, Rectangle } from 'react-leaflet'

import {
  Vector_layer_displays as VectorLayerDisplay,
  Layer_presentations as LayerPresentation,
} from '../../../../../generated/client/index.ts'
import { vectorLayerDisplayToProperties } from '../../../../../modules/vectorLayerDisplayToProperties.ts'
import './display.css'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
}
const displayPropertyValueStyle = {
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 8,
  fontWeight: 'bold',
}

type Props = {
  display: VectorLayerDisplay
  layerPresentation: LayerPresentation
}

// idea: use a leaflet map to display: a rectangle, line and point
// build map and pass geometries as data attribute to GeoJSON, using vectorLayerDisplayToProperties as in TableLayer.tsx
export const Display = memo(({ display, layerPresentation }) => {
  return (
    <div style={containerStyle}>
      {/* if a display_property_value exists, display it */}
      <MapContainer
        crs={L.CRS.Simple}
        zoomControl={false}
        attributionControl={false}
        boxZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        dragging={false}
        style={{
          width: 20,
          height: 20,
        }}
        bounds={[
          [0, 0],
          [20, 20],
        ]}
      >
        <Rectangle
          bounds={[
            [1, 1],
            [19, 19],
          ]}
          pathOptions={vectorLayerDisplayToProperties({
            vectorLayerDisplay: display,
            presentation: layerPresentation,
          })}
        />
      </MapContainer>
      <p style={displayPropertyValueStyle}>
        {display.display_property_value ?? ''}
      </p>
    </div>
  )
})
