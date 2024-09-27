import { memo } from 'react'

import { Vector_layer_displays as VectorLayerDisplay } from '../../../../../generated/client/index.ts'

type Props = {
  display: VectorLayerDisplay
}

// idea: use a leaflet map to display: a rectangle, line and point
// build map and pass in the objects
export const Display = memo(({ display }: Props) => {
  return (
    <>
      {/* if a display_property_value exists, display it */}
      {display.display_property_value && (
        <h3>{display.display_property_value}</h3>
      )}
      {`TODO: ${display.vector_layer_display_id}`}
    </>
  )
})
