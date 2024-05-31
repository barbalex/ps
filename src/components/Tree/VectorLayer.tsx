import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { Vector_layers as VectorLayer } from '../../../generated/client/index.ts'
import { VectorLayerDisplaysNode } from './VectorLayerDisplays.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  vectorLayer: VectorLayer
  level?: number
}

export const VectorLayerNode = memo(
  ({ project_id, vectorLayer, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'vector-layers' &&
      urlPath[4] === vectorLayer.vector_layer_id
    const isActive = isOpen && urlPath.length === level + 1

    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'vector-layers'],
      [project_id],
    )
    const baseUrl = `/data/projects/${project_id}/vector-layers`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${vectorLayer.vector_layer_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams, vectorLayer.vector_layer_id])

    return (
      <>
        <Node
          node={vectorLayer}
          id={vectorLayer.vector_layer_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={0}
          to={`${baseUrl}/${vectorLayer.vector_layer_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <VectorLayerDisplaysNode
            project_id={project_id}
            vector_layer_id={vectorLayer.vector_layer_id}
          />
        )}
      </>
    )
  },
)
