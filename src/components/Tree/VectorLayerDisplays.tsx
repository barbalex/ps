import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { VectorLayerDisplayNode } from './VectorLayerDisplay.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

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
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
    )

    const vectorLayerDisplaysNode = useMemo(
      () => ({ label: `Displays (${vlds.length})` }),
      [vlds.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'vector-layers', vector_layer_id],
      [project_id, vector_layer_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, 'vector-layer-displays'],
      [parentArray],
    )
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: parentArray,
          db,
          appStateId: appState?.app_state_id,
        })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({
        nodes: [ownArray],
        db,
        appStateId: appState?.app_state_id,
      })
    }, [
      appState?.app_state_id,
      db,
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={vectorLayerDisplaysNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={vlds.length}
          to={ownUrl}
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
