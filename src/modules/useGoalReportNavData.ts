import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  goalId: string
  goalReportId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useGoalReportNavData = ({
  projectId,
  subprojectId,
  goalId,
  goalReportId,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData>(
    `
      SELECT
        goal_report_id AS id,
        label
      FROM 
        goal_reports
      WHERE 
        goal_reports.goal_report_id = '${goalReportId}'`,
  )
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

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
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

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

  return { navData, loading }
}
