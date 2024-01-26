import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Vector_layers as VectorLayer } from '../../../generated/client'
import { VectorLayerNode } from './VectorLayer'

export const VectorLayersNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const vectorLayers: VectorLayer[] = results ?? []

  const vectorLayersNode = useMemo(
    () => ({
      label: `Vector Layers (${vectorLayers.length})`,
    }),
    [vectorLayers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'vector-layers'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/vector-layers`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={vectorLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={vectorLayers.length}
        to={`/projects/${project_id}/vector-layers`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        vectorLayers.map((vectorLayer) => (
          <VectorLayerNode
            key={vectorLayer.vector_layer_id}
            project_id={project_id}
            vectorLayer={vectorLayer}
          />
        ))}
    </>
  )
}
