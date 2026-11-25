import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  goalId: string
}

export const useGoalGoalNavData = ({
  projectId,
  subprojectId,
  goalId,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const { formatMessage } = useIntl()

  useLiveQuery(/* sql */ `
    SELECT
      label,
      project_id as id
    FROM projects
    WHERE project_id = '${projectId}'`)

  useLiveQuery(/* sql */ `
    SELECT
      label,
      subproject_id as id
    FROM subprojects
    WHERE subproject_id = '${subprojectId}'`)

  const goalQuery = useLiveQuery(/* sql */ `
    SELECT
      label,
      goal_id as id
    FROM goals
    WHERE goal_id = '${goalId}'`)
  const goal = goalQuery?.rows?.[0]

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
  const ownArray = [...parentArray, 'goal']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!goalQuery && !goal
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : formatMessage({ id: 'Ikw+kl', defaultMessage: 'Ziel' })

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
