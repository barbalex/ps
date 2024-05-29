import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  vector_layer_id: string
  vectorLayerDisplay: VectorLayerDisplay
  level: number
}

export const VectorLayerDisplayNode = memo(
  ({ project_id, vector_layer_id, vectorLayerDisplay, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'vector-layers' &&
      urlPath[4] === vector_layer_id &&
      urlPath[5] === 'vector-layer-displays' &&
      urlPath[6] === vectorLayerDisplay.vector_layer_display_id
    const isActive = isOpen && urlPath.length === 6

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'vector-layers',
        vector_layer_id,
        'vector-layer-displays',
      ],
      [project_id, vector_layer_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, vectorLayerDisplay.vector_layer_display_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${vectorLayerDisplay.vector_layer_display_id}`,
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
      vectorLayerDisplay.vector_layer_display_id,
    ])

    return (
      <Node
        node={vectorLayerDisplay}
        id={vectorLayerDisplay.vector_layer_display_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${vectorLayerDisplay.vector_layer_display_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
