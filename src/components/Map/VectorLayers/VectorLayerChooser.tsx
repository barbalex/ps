import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerWFS } from './VectorLayerWFS'
import { VectorLayerPVLGeom } from './VectorLayerPVLGeom'
import { useElectric } from '../../../ElectricProvider'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

export const VectorLayerChooser = ({ layer }) => {
  const { db } = useElectric()!

  const { results: vectorLayerGeoms = [] } = useLiveQuery(
    db.vector_layer_geoms.liveMany({
      where: { vector_layer_id: layer.vector_layer_id, deleted: false },
    }),
  )
  const geomCount: integer = vectorLayerGeoms.length

  // console.log('hello VectorLayerChooser', { layer, db, geomCount })

  // TODO: only accept pre-downloaded layers because of
  // problems filtering by bbox?
  if (!geomCount) return <VectorLayerWFS layer={layer} />
  return <VectorLayerPVLGeom layer={layer} />
}
