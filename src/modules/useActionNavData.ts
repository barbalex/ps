import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const useActionNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        action_values_count AS (SELECT count(*) FROM action_values WHERE action_id = '${actionId}'),
        action_reports_count AS (SELECT count(*) FROM action_reports WHERE action_id = '${actionId}')
      SELECT
        action_id AS id,
        label,
        action_values_count.count AS action_values_count,
        action_reports_count.count AS action_reports_count
      FROM 
        actions,
        action_values_count,
        action_reports_count
      WHERE 
        actions.action_id = '${actionId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
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
        { id: 'action', label: 'Action' },
        {
          id: 'values',
          label: buildNavLabel({
            loading,
            countFiltered: row?.action_values_count ?? 0,
            namePlural: 'Values',
          }),
        },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            countFiltered: row?.action_reports_count ?? 0,
            namePlural: 'Reports',
          }),
        },
      ],
    }
  }, [
    projectId,
    subprojectId,
    placeId,
    placeId2,
    row?.id,
    row?.label,
    row?.action_values_count,
    row?.action_reports_count,
    openNodes,
    loading,
  ])

  return { navData, loading }
}
