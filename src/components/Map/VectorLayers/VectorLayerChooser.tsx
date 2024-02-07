import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerWFS } from './VectorLayerWFS'
import { VectorLayerPVLGeom } from './VectorLayerPVLGeom'
import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
} from '../../../generated/client'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

type Props = {
  layer: VectorLayer
  display: VectorLayerDisplay
}

export const VectorLayerChooser = ({ layer, display }: Props) => {
  const { db } = useElectric()!

  const { results: vectorLayerGeoms = [] } = useLiveQuery(
    db.vector_layer_geoms.liveMany({
      where: { vector_layer_id: layer.vector_layer_id, deleted: false },
    }),
  )
  const geomCount: integer = vectorLayerGeoms.length

  console.log('hello VectorLayerChooser', { layer, db, geomCount, display })

  // TODO: only accept pre-downloaded layers because of
  // problems filtering by bbox?
  if (!geomCount) return <VectorLayerWFS layer={layer} display={display} />
  return <VectorLayerPVLGeom layer={layer} display={display} />
}
