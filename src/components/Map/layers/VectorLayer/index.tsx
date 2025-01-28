import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import { WFS } from './WFS.tsx'
import { PVLGeom } from './PVLGeom.tsx'
import {
  Vector_layers as VectorLayer,
  Layer_presentations as LayerPresentation,
} from '../../../../generated/client/index.ts'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

interface Props {
  layer: VectorLayer
  layerPresentation: LayerPresentation
}

export const VectorLayerChooser = ({ layer, layerPresentation }: Props) => {
  const db = usePGlite()

  const { results: vectorLayerGeoms = [] } = useLiveQuery(
    db.vector_layer_geoms.liveMany({
      where: { vector_layer_id: layer.vector_layer_id },
    }),
  )
  const geomCount: integer = vectorLayerGeoms.length

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
