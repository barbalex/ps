import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'
import { validateIds } from './validateIds.ts'

type Props = {
  projectId: string
  subprojectId: string
  goalId: string
}

type NavData = {
  id: string
  label: string
}[]

export const useGoalReportsNavData = ({
  projectId,
  subprojectId,
  goalId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  // Validate after hooks to comply with Rules of Hooks
  validateIds({ projectId, subprojectId, goalId })

  const res = useLiveQuery(
    `
      SELECT 
        goal_report_id AS id, 
        label 
      FROM goal_reports 
      WHERE goal_id = $1 
      ORDER BY label`,
    [goalId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'goals',
    goalId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'reports']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered: navs.length,
      namePlural: 'Goal Reports',
      loading,
    }),
    nameSingular: 'Goal Report',
    navs,
  }

  return { loading, navData }
}
