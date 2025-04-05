import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const useActionReportNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  actionReportId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        action_report_values_count AS (SELECT count(*) FROM action_report_values WHERE action_report_id = '${actionReportId}')
      SELECT
        action_report_id AS id,
        label,
        action_report_values_count.count AS action_report_values_count
      FROM 
        action_reports,
        action_report_values_count
      WHERE 
        action_reports.action_report_id = '${actionReportId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const row = res?.rows?.[0]

  console.log('useActionReportNavData', {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
    row,
    loading,
    sql,
    res,
  })

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
      actionId,
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
        { id: 'report', label: 'Report' },
        {
          id: 'values',
          label: buildNavLabel({
            loading,
            countFiltered: row?.action_report_values_count ?? 0,
            namePlural: 'Values',
          }),
        },
      ],
    }
  }, [
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    row?.id,
    row?.label,
    row?.action_report_values_count,
    openNodes,
    loading,
  ])

  return { navData, loading }
}
