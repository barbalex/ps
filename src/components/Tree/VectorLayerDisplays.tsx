import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { VectorLayerDisplayNode } from './VectorLayerDisplay.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  vector_layer_id: string
  level?: number
}

export const VectorLayerDisplaysNode = memo(
  ({ project_id, vector_layer_id, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const res = useLiveIncrementalQuery(
      `
      SELECT
        vector_layer_display_id,
        label
      FROM vector_layer_displays 
      WHERE vector_layer_id = $1 
      ORDER BY label`,
      [vector_layer_id],
      'vector_layer_display_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Displays (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
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
        removeChildNodes({ node: ownArray })
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
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((vld) => (
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
