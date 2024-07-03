import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerWFS } from './VectorLayerWFS.tsx'
import { VectorLayerPVLGeom } from './VectorLayerPVLGeom.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import { Vector_layers as VectorLayer } from '../../../generated/client/index.ts'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

interface Props {
  layer: VectorLayer
}

export const VectorLayerChooser = ({ layer }: Props) => {
  const { db } = useElectric()!

  const { results: vectorLayerGeoms = [] } = useLiveQuery(
    db.vector_layer_geoms.liveMany({
      where: { vector_layer_id: layer.vector_layer_id },
    }),
  )
  const geomCount: integer = vectorLayerGeoms.length

  if (!geomCount) return <VectorLayerWFS layer={layer} />
  // TODO: what is this?
  return <VectorLayerPVLGeom layer={layer} />
}
