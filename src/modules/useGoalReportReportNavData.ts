import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId_: string
  subprojectId_: string
  goalId_: string
  goalReportId_: string
}

type NavData = {
  id: string
  label: string | null
}

export const useGoalReportReportNavData = ({
  projectId_,
  subprojectId_,
  goalId_,
  goalReportId_,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const projectId = projectId_?.replace(/_/g, '-')
  const subprojectId = subprojectId_?.replace(/_/g, '-')
  const goalId = goalId_?.replace(/_/g, '-')
  const goalReportId = goalReportId_?.replace(/_/g, '-')

  const goalReportQuery = useLiveQuery(/* sql */ `
    SELECT
      name as label,
      goal_report_id as id
    FROM goal_reports
    WHERE goal_report_id = '${goalReportId}'`)
  const goalReport = goalReportQuery?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId_,
    'subprojects',
    subprojectId_,
    'goals',
    goalId_,
    'reports',
    goalReportId_,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'report']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!goalReportQuery && !goalReport
  const label = notFound ? 'Not Found' : 'Report'

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
    navs: [],
  }

  const loading = goalReportQuery === undefined

  return { navData, loading }
}
