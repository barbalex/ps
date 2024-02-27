import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Tile_layers as TileLayer } from '../../../generated/client'

interface Props {
  project_id: string
  tileLayer: TileLayer
  level?: number
}

export const TileLayerNode = memo(
  ({ project_id, tileLayer, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'tile-layers' &&
      urlPath[3] === tileLayer.tile_layer_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/tile-layers`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${tileLayer.tile_layer_id}`)
    }, [baseUrl, isOpen, navigate, tileLayer.tile_layer_id])

    return (
      <Node
        node={tileLayer}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${tileLayer.tile_layer_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
