import { memo } from 'react'

import { Vector_layer_displays as VectorLayerDisplay } from '../../../../../generated/client/index.ts'

type Props = {
  display: VectorLayerDisplay
}

// idea:
// fetch all vector_layer_displays for this layer
// use a leaflet map to display for every vector_layer_display:
// a rectangle, line, point

export const Display = memo(({ display }: Props) => {
  return <>{`TODO: ${display.vector_layer_display_id}`}</>
})
