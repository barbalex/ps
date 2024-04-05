import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { VectorLayerNode } from './VectorLayer'

interface Props {
  project_id: string
  level?: number
}

export const VectorLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const vectorLayersNode = useMemo(
    () => ({ label: `Vector Layers (${vectorLayers.length})` }),
    [vectorLayers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'vector-layers'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/vector-layers`,
      search: searchParams.toString(),
    })
  }, [baseUrl, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={vectorLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={vectorLayers.length}
        to={`${baseUrl}/vector-layers`}
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
})
