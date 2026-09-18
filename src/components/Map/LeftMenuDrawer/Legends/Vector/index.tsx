import { useLiveQuery } from '@electric-sql/pglite-react'

import { Display } from './Display.tsx'
import type VectorLayerDisplays from '../../../../../models/public/VectorLayerDisplays.ts'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'

interface VectorLegendProps {
  layer: VectorLayers & {
    layer_presentations?: { opacity_percent?: number | null }[]
  }
}

export const VectorLegend = ({ layer }: VectorLegendProps) => {
  // fetch all vector_layer_displays for this layer
  const res = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [layer.vector_layer_id],
  )
  const vectorLayerDisplays = (res?.rows ?? []) as unknown as VectorLayerDisplays[]

  return vectorLayerDisplays.map((display) => (
    <Display
      key={display.vector_layer_display_id}
      display={display}
      layerPresentation={layer?.layer_presentations?.[0]}
    />
  ))
}
