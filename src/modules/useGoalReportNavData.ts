import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const useGoalReportNavData = ({
  projectId,
  subprojectId,
  goalId,
  goalReportId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const res = useLiveQuery(
    `
      WITH 
        goal_report_values_count AS (SELECT count(*) FROM goal_report_values WHERE goal_report_id = '${goalReportId}')
      SELECT
        goal_report_id AS id,
        label,
        goal_report_values_count.count AS goal_report_values_count
      FROM 
        goal_reports,
        goal_report_values_count
      WHERE 
        goal_reports.goal_report_id = '${goalReportId}'`,
  )
  const loading = res === undefined

  const nav = res?.rows?.[0]

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
  const ownArray = [...parentArray, goalReportId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 2,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    navs: [
      { id: 'report', label: 'Report' },
      {
        id: 'values',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.goal_report_values_count ?? 0,
          namePlural: 'Values',
        }),
      },
    ],
  }

  return { navData, loading }
}
