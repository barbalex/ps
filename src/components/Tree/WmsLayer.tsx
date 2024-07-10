import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  wmsLayer: WmsLayer
  level?: number
}

export const WmsLayerNode = memo(
  ({ project_id, wmsLayer, level = 4 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'wms-layers',
        wmsLayer.wms_layer_id,
      ],
      [project_id, wmsLayer.wms_layer_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={wmsLayer}
        id={wmsLayer.wms_layer_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
