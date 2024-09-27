import { memo } from 'react'
import { MapContainer, Rectangle } from 'react-leaflet'

import {
  Vector_layer_displays as VectorLayerDisplay,
  Layer_presentations as LayerPresentation,
} from '../../../../../generated/client/index.ts'
import { vectorLayerDisplayToProperties } from '../../../../../modules/vectorLayerDisplayToProperties.ts'

type Props = {
  display: VectorLayerDisplay
  layerPresentation: LayerPresentation
}

// idea: use a leaflet map to display: a rectangle, line and point
// build map and pass geometries as data attribute to GeoJSON, using vectorLayerDisplayToProperties as in TableLayer.tsx
export const Display = memo(({ display, layerPresentation }: Props) => {
  return (
    <>
      {/* if a display_property_value exists, display it */}
      {display.display_property_value && (
        <h3>{display.display_property_value}</h3>
      )}
      {`TODO: ${display.vector_layer_display_id}`}
      <MapContainer
        zoomControl={false}
        attributionControl={false}
        boxZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        dragging={false}
        style={{ width: 100, height: 100 }}
        bounds={[
          [51.49, -0.08],
          [51.5, -0.06],
        ]}
      >
        <Rectangle
          bounds={[
            [51.487, -0.083],
            [51.503, -0.057],
          ]}
          pathOptions={vectorLayerDisplayToProperties({
            vectorLayerDisplay: display,
            presentation: layerPresentation,
          })}
        />
      </MapContainer>
    </>
  )
})
