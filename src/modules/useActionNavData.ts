import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  actionId: string
}

type NavData = {
  id: string
  label: string
  action_values_count: number
  action_reports_count: number
  files_count: number
}

export const useActionNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        action_values_count AS (SELECT count(*) FROM action_values WHERE action_id = '${actionId}'),
        action_reports_count AS (SELECT count(*) FROM action_reports WHERE action_id = '${actionId}'),
        files_count AS (SELECT count(*) FROM files WHERE action_id = '${actionId}')
      SELECT
        action_id AS id,
        label,
        action_values_count.count AS action_values_count,
        action_reports_count.count AS action_reports_count,
        files_count.count AS files_count
      FROM 
        actions,
        action_values_count,
        action_reports_count,
        files_count
      WHERE 
        actions.action_id = '${actionId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'actions',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
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
      { id: 'action', label: 'Action' },
      {
        id: 'values',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.action_values_count ?? 0,
          namePlural: 'Values',
        }),
      },
      {
        id: 'reports',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.action_reports_count ?? 0,
          namePlural: 'Reports',
        }),
      },
      {
        id: 'files',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.files_count ?? 0,
          namePlural: 'Files',
        }),
      },
    ],
  }

  return { navData, loading }
}
