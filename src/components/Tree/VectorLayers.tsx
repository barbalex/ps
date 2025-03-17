import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { VectorLayerNode } from './VectorLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom, vectorLayersFilterAtom } from '../../store.ts'

interface Props {
  projectId: string
  level?: number
}

export const VectorLayersNode = memo(({ projectId, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(vectorLayersFilterAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const sql = `
    SELECT
      vector_layer_id,
      label 
    FROM vector_layers 
    WHERE 
      project_id = $1
      ${isFiltered ? `AND ${filterString} ` : ''} 
    ORDER BY label;`
  const resFiltered = useLiveQuery(sql, [projectId])
  const rows = resFiltered?.rows ?? []
  const rowsLoading = resFiltered === undefined
  // above query errors when filtering by a string column (label)
  // https://github.com/electric-sql/pglite/issues/570
  // console.warn('Tree.VectorLayersNode', {
  //   rows,
  //   rowsLoading,
  //   resFiltered,
  //   filterString,
  //   filter,
  //   sql,
  // })

  const resCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM vector_layers WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resCountUnfiltered === undefined

  const node = useMemo(
    () => ({
      label: `Vector Layers (${
        isFiltered ?
          `${rowsLoading ? '...' : formatNumber(rows.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : rowsLoading ? '...'
        : formatNumber(rows.length)
      })`,
    }),
    [isFiltered, rowsLoading, rows.length, countLoading, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', projectId],
    [projectId],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, 'vector-layers'],
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
        navigate({ to: parentUrl })
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
        rows.map((vectorLayer) => (
          <VectorLayerNode
            key={vectorLayer.vector_layer_id}
            projectId={projectId}
            vectorLayer={vectorLayer}
          />
        ))}
    </>
  )
})
