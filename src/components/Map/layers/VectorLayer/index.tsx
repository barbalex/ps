// import { useLiveQuery } from '@electric-sql/pglite-react'

import { WFS } from './WFS.tsx'
import { PVLGeom } from './PVLGeom.tsx'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

// [vite] TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')
export const VectorLayerChooser = ({ layer, layerPresentation }) => {
  // const res = useLiveQuery(
  //   `SELECT * FROM vector_layer_geoms WHERE vector_layer_id = $1`,
  //   [layer.vector_layer_id],
  // )
  // const vectorLayerGeoms = res?.rows ?? []
  // const geomCount = vectorLayerGeoms.length

  // TODO: check if there are local geometries
  const geomCount = 0

  // TODO: pass layerPresentation only when vector layers are not shown directly in Map anymore
  if (!geomCount)
    return <WFS layer={layer} layerPresentation={layerPresentation} />
  // TODO: what is this? Local data / Offline version
  return <PVLGeom layer={layer} />
}
