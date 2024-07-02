import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerWFS } from './VectorLayerWFS.tsx'
import { VectorLayerPVLGeom } from './VectorLayerPVLGeom.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import {
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
} from '../../../generated/client/index.ts'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

interface Props {
  layer: VectorLayer
}

export const VectorLayerChooser = ({ layer }: Props) => {
  const { db } = useElectric()!

  const display = layer.vector_layer_displays.find(
    (d) => d.vector_layer_id === layer.vector_layer_id,
  )

  const { results: vectorLayerGeoms = [] } = useLiveQuery(
    db.vector_layer_geoms.liveMany({
      where: { vector_layer_id: layer.vector_layer_id },
    }),
  )
  const geomCount: integer = vectorLayerGeoms.length

  // TODO: only accept pre-downloaded layers because of
  // problems filtering by bbox?
  if (!geomCount) return <VectorLayerWFS layer={layer} display={display} />
  return <VectorLayerPVLGeom layer={layer} display={display} />
}
