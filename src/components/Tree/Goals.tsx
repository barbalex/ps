import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { GoalNode } from './Goal.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom, goalsFilterAtom } from '../../store.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const GoalsNode = memo(
  ({ projectId, subprojectId, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filter] = useAtom(goalsFilterAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const filterString = filterStringFromFilter(filter)
    const isFiltered = !!filterString
    const resFiltered = useLiveIncrementalQuery(
      `
      SELECT 
        goal_id, 
        label
      FROM goals 
      WHERE 
        subproject_id = $1
        ${isFiltered ? ` AND ${filterString}` : ''} 
      ORDER BY label`,
      [subprojectId],
      'goal_id',
    )
    const rows = resFiltered?.rows ?? []
    const rowsLoading = resFiltered === undefined

    const resultCountUnfiltered = useLiveQuery(
      `SELECT count(*) FROM goals WHERE subproject_id = $1`,
      [subprojectId],
    )
    const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
    const countLoading = resultCountUnfiltered === undefined

    const node = useMemo(
      () => ({
        label: `Goals (${
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
      () => ['data', 'projects', projectId, 'subprojects', subprojectId],
      [projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'goals'], [parentArray])
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
          rows.map((goal) => (
            <GoalNode
              key={goal.goal_id}
              projectId={projectId}
              subprojectId={subprojectId}
              goal={goal}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
