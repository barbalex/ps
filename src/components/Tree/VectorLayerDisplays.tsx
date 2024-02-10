import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client'
import { VectorLayerDisplayNode } from './VectorLayerDisplay'

export const VectorLayerDisplaysNode = ({
  project_id,
  vector_layer_id,
  level = 5,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { deleted: false, vector_layer_id },
      orderBy: { label: 'asc' },
    }),
  )
  const vlds: VectorLayerDisplay[] = results

  const vectorLayerDisplaysNode = useMemo(
    () => ({
      label: `Displays (${vlds.length})`,
    }),
    [vlds.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'vector-layers' &&
    urlPath[3] === vector_layer_id &&
    urlPath[4] === 'vector-layer-displays'
  const isActive = isOpen && urlPath.length === 5

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/vector-layers/${vector_layer_id}`,
      )
    navigate(
      `/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays`,
    )
  }, [isOpen, navigate, project_id, vector_layer_id])

  return (
    <>
      <Node
        node={vectorLayerDisplaysNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={vlds.length}
        to={`/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        vlds.map((vld) => (
          <VectorLayerDisplayNode
            key={vld.vector_layer_display_id}
            project_id={project_id}
            vector_layer_id={vector_layer_id}
            vectorLayerDisplay={vld}
          />
        ))}
    </>
  )
}
