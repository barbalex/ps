import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId_: string
  subprojectId_: string
  goalId_: string
}

type NavData = {
  id: string
  label: string | null
}

export const useGoalGoalNavData = ({
  projectId_,
  subprojectId_,
  goalId_,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const projectId = projectId_?.replace(/_/g, '-')
  const subprojectId = subprojectId_?.replace(/_/g, '-')
  const goalId = goalId_?.replace(/_/g, '-')

  const projectQuery = useLiveQuery(/* sql */ `
    SELECT
      name as label,
      project_id as id
    FROM projects
    WHERE project_id = '${projectId}'`)
  const project = projectQuery?.rows?.[0]

  const subprojectQuery = useLiveQuery(/* sql */ `
    SELECT
      name as label,
      subproject_id as id
    FROM subprojects
    WHERE subproject_id = '${subprojectId}'`)
  const subproject = subprojectQuery?.rows?.[0]

  const goalQuery = useLiveQuery(/* sql */ `
    SELECT
      name as label,
      goal_id as id
    FROM goals
    WHERE goal_id = '${goalId}'`)
  const goal = goalQuery?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId_,
    'subprojects',
    subprojectId_,
    'goals',
    goalId_,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'goal']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!goalQuery && !goal
  const label = notFound ? 'Not Found' : 'Goal'

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

  const loading = goalQuery === undefined

  return { navData, loading }
}
