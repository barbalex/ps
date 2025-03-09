import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ListNode } from './List.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, listsFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

interface Props {
  project_id: string
  level?: number
}

export const ListsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(listsFilterAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const resultFiltered = useLiveIncrementalQuery(
    `
    SELECT 
      list_id,
      label
    FROM lists 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [project_id],
    'list_id',
  )
  const lists = resultFiltered?.rows || []
  const listsLoading = resultFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT COUNT(*) FROM lists WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count || 0
  const countLoading = resultCountUnfiltered === undefined

  const listsNode = useMemo(
    () => ({
      label: `Lists (${
        isFiltered
          ? `${listsLoading ? '...' : lists.length}/${
              countLoading ? '...' : countUnfiltered
            }`
          : listsLoading
          ? '...'
          : lists.length
      })`,
    }),
    [isFiltered, listsLoading, lists.length, countLoading, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'lists'], [parentArray])
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
        node={listsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={lists.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        lists.map((list) => (
          <ListNode
            key={list.list_id}
            project_id={project_id}
            list={list}
          />
        ))}
    </>
  )
})
