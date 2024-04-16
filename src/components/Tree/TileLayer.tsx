import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

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
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'tile-layers' &&
      urlPath[3] === tileLayer.tile_layer_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/tile-layers`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${tileLayer.tile_layer_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams, tileLayer.tile_layer_id])

    return (
      <Node
        node={tileLayer}
        id={tileLayer.tile_layer_id}
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
