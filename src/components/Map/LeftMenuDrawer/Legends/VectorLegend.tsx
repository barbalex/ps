import { memo } from 'react'
// idea:
// fetch all vector_layer_displays for this layer
// use a leaflet map to display for every vector_layer_display:
// a rectangle, line, point

export const VectorLegend = memo(({ layer }) => {
  return <>{`TODO: Vector layer '${layer.label}'`}</>
})
