import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Tile_layers as TileLayer } from '../../../generated/client'

export const TileLayerNode = ({
  project_id,
  tileLayer,
  level = 4,
}: {
  project_id: string
  tileLayer: TileLayer
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'tile-layers' &&
    urlPath[3] === tileLayer.tile_layer_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/tile-layers`)
    navigate(`/projects/${project_id}/tile-layers/${tileLayer.tile_layer_id}`)
  }, [isOpen, navigate, project_id, tileLayer.tile_layer_id])

  return (
    <Node
      node={tileLayer}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/tile-layers/${tileLayer.tile_layer_id}`}
      onClickButton={onClickButton}
    />
  )
}
