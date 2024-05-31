import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Tile_layers as TileLayer } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  tileLayer: TileLayer
  level?: number
}

export const TileLayerNode = memo(
  ({ project_id, tileLayer, level = 4 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'tile-layers',
        tileLayer.tile_layer_id,
      ],
      [project_id, tileLayer.tile_layer_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={tileLayer}
        id={tileLayer.tile_layer_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
