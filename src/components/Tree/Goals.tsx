import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { GoalNode } from './Goal.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, goalsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const GoalsNode = memo(
  ({ project_id, subproject_id, level = 5 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filter] = useAtom(goalsFilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const db = usePGlite()

    const where = filter.length > 1 ? { OR: filter } : filter[0]
    const { results: goals = [] } = useLiveQuery(
      db.goals.liveMany({
        where: { subproject_id, ...where },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: goalsUnfiltered = [] } = useLiveQuery(
      db.goals.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered = goals.length !== goalsUnfiltered.length

    const goalsNode = useMemo(
      () => ({
        label: `Goals (${
          isFiltered
            ? `${goals.length}/${goalsUnfiltered.length}`
            : goals.length
        })`,
      }),
      [goals.length, goalsUnfiltered.length, isFiltered],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
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
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={goalsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={goals.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          goals.map((goal) => (
            <GoalNode
              key={goal.goal_id}
              project_id={project_id}
              subproject_id={subproject_id}
              goal={goal}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
