import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import { Display } from './Display.tsx'

export const VectorLegend = memo(({ layer }) => {
  // fetch all vector_layer_displays for this layer
  const db = usePGlite()
  const { results: vectorLayerDisplays = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id: layer.vector_layer_id },
    }),
  )

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
