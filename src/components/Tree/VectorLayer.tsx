import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Vector_layers as VectorLayer } from '../../../generated/client'

export const VectorLayerNode = ({
  project_id,
  vectorLayer,
  level = 4,
}: {
  project_id: string
  vectorLayer: VectorLayer
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'vector-layers' &&
    urlPath[3] === vectorLayer.vector_layer_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/vector-layers`)
    navigate(`/projects/${project_id}/vector-layers/${vectorLayer.vector_layer_id}`)
  }, [isOpen, navigate, project_id, vectorLayer.vector_layer_id])

  return (
    <Node
      node={vectorLayer}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/vector-layers/${vectorLayer.vector_layer_id}`}
      onClickButton={onClickButton}
    />
  )
}
