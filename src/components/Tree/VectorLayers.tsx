import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { VectorLayerNode } from './VectorLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id: string
  level?: number
}

export const VectorLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const vectorLayersNode = useMemo(
    () => ({ label: `Vector Layers (${vectorLayers.length})` }),
    [vectorLayers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'projects' &&
    urlPath[2] === project_id &&
    urlPath[3] === 'vector-layers'
  const isActive = isOpen && urlPath.length === level + 1

  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const baseUrl = parentArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...parentArray, 'vector-layers'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/vector-layers`,
      search: searchParams.toString(),
    })
  }, [
    appState?.app_state_id,
    parentArray,
    baseUrl,
    db,
    isOpen,
    navigate,
    searchParams,
  ])

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
