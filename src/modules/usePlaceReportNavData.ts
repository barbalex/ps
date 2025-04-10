import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const usePlaceReportNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeReportId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        place_report_values_count AS (SELECT count(*) FROM place_report_values WHERE place_report_id = '${placeReportId}')
      SELECT
        place_report_id AS id,
        label,
        place_report_values_count.count AS place_report_values_count
      FROM 
        place_reports,
        place_report_values_count
      WHERE 
        place_reports.place_report_id = '${placeReportId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]

    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'places',
      placeId,
      ...(placeId2 ? ['places', placeId2] : []),
      'reports',
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

    return {
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
            countFiltered: nav?.place_report_values_count ?? 0,
            namePlural: 'Values',
          }),
        },
      ],
    }
  }, [res, projectId, subprojectId, placeId, placeId2, openNodes, loading])

  return { navData, loading }
}
