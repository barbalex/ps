import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { Vector_layers as VectorLayer } from '../../../../../generated/client/index.ts'
import { useElectric } from '../../../../../ElectricProvider.tsx'
import { Display } from './Display.tsx'

type Props = {
  layer: VectorLayer
}

export const VectorLegend = memo(({ layer }: Props) => {
  // fetch all vector_layer_displays for this layer
  const { db } = useElectric()!
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
