import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useGoalReportValueNavData = ({
  projectId,
  subprojectId,
  goalId,
  goalReportId,
  goalReportValueId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        goal_report_value_id AS id,
        label
      FROM goal_report_values 
      WHERE goal_report_value_id = $1`,
    [goalReportValueId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
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
      goalReportId,
      'values',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, goalReportValueId]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      nameSingular: 'Goal Report Value',
    }
  }, [
    goalId,
    goalReportId,
    goalReportValueId,
    location.pathname,
    openNodes,
    projectId,
    res,
    subprojectId,
  ])

  return { loading, navData }
}
