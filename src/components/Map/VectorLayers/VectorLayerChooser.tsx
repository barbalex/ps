import { useLiveQuery } from 'dexie-react-hooks'

import { dexie } from '../../../dexieClient'
import VectorLayerWFS from './VectorLayerWFS'
import VectorLayerPVLGeom from './VectorLayerPVLGeom'
import { useElectric } from '../../../ElectricProvider'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

export const VectorLayerChooser = ({ layer }) => {
  const { db } = useElectric()!

  // TODO: add pvl_geoms to sqlite
  const pvlGeomCount: integer = useLiveQuery(
    async () =>
      await dexie.pvl_geoms
        .where({
          deleted: 0,
          pvl_id: layer.id,
        })
        .count(),
    [layer.id],
  )

  // TODO: only accept pre-downloaded layers because of
  // problems filtering by bbox?
  if (pvlGeomCount === undefined) return null
  if (pvlGeomCount === 0) return <VectorLayerWFS layer={layer} />
  return <VectorLayerPVLGeom layer={layer} />
}
