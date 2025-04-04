import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useGoalNavData = ({ projectId, subprojectId, goalId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const res = useLiveQuery(
    `
      WITH 
        goal_reports_count AS (SELECT count(*) FROM goal_reports WHERE goal_id = '${goalId}')
      SELECT
        goal_id AS id,
        label,
        goal_reports_count.count AS goal_reports_count
      FROM 
        goals,
        goal_reports_count
      WHERE 
        goals.goalId = '${goalId}'`,
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'goals',
      goalId,
      'reports',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 2,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: row?.label,
      navs: [
        { id: 'goal', label: 'Goal' },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            countFiltered: row?.goal_reports_count ?? 0,
            namePlural: 'Goal Reports',
          }),
        },
      ],
    }
  }, [
    projectId,
    subprojectId,
    goalId,
    row?.id,
    row?.label,
    row?.goal_reports_count,
    openNodes,
    loading,
  ])

  return { navData, loading }
}
