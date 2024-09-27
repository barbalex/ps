import { memo } from 'react'

import { Vector_layers as VectorLayer } from '../../../../../generated/client/index.ts'
// idea:
// fetch all vector_layer_displays for this layer
// use a leaflet map to display for every vector_layer_display:
// a rectangle, line, point

type Props = {
  layer: VectorLayer
}

export const VectorLegend = memo(({ layer }: Props) => {
  return <>{`TODO: Vector layer '${layer.label}'`}</>
})
