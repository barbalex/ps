import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Display } from './Display.tsx'

export const VectorLegend = memo(({ layer }) => {
  // fetch all vector_layer_displays for this layer
  const res = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [layer.vector_layer_id],
  )
  const vectorLayerDisplays = res.rows ?? []

  return vectorLayerDisplays.map((display) => {
    return (
      <Display
        key={display.vector_layer_display_id}
        display={display}
        layerPresentation={layer?.layer_presentations?.[0]}
      />
    )
  })
})
