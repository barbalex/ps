import { useLiveQuery } from '@electric-sql/pglite-react'

import { WFS } from './WFS.tsx'
import { PVLGeom } from './PVLGeom.tsx'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

export const VectorLayerChooser = ({ layer, layerPresentation }) => {
  const res = useLiveQuery(
    `SELECT * FROM vector_layer_geoms WHERE vector_layer_id = $1`,
    [layer.vector_layer_id],
  )
  const vectorLayerGeoms = res?.rows ?? []
  const geomCount = vectorLayerGeoms.length

  // TODO: pass layerPresentation only when vector layers are not shown directly in Map anymore
  if (!geomCount)
    return (
      <WFS
        layer={layer}
        layerPresentation={layerPresentation}
      />
    )
  // TODO: what is this? Local data / Offline version
  return <PVLGeom layer={layer} />
}
