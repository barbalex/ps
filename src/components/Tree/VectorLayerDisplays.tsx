import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { VectorLayerDisplayNode } from './VectorLayerDisplay.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  vector_layer_id: string
  level?: number
}

export const VectorLayerDisplaysNode = memo(
  ({ project_id, vector_layer_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: vlds = [] } = useLiveQuery(
      db.vector_layer_displays.liveMany({
        where: { vector_layer_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const vectorLayerDisplaysNode = useMemo(
      () => ({ label: `Displays (${vlds.length})` }),
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

    const baseArray = useMemo(
      () => ['projects', project_id, 'vector-layers', vector_layer_id],
      [project_id, vector_layer_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'vector-layer-displays'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/vector-layer-displays`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

    return (
      <>
        <Node
          node={vectorLayerDisplaysNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={vlds.length}
          to={`${baseUrl}/vector-layer-displays`}
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
  },
)
