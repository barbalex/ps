import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const useChartNavData = ({ projectId, subprojectId, chartId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      WITH
        chart_subjects_count AS (SELECT count(*) FROM chart_subjects WHERE chart_id = '${chartId}')
      SELECT
        chart_id AS id,
        label,
        chart_subjects_count.count AS chart_subjects_count
      FROM 
        charts,
        chart_subjects_count
      WHERE 
        charts.chart_id = '${chartId}'`
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
      'charts',
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
        { id: 'chart', label: 'Chart' },
        {
          id: 'subjects',
          label: buildNavLabel({
            loading,
            countFiltered: row?.chart_subjects_count ?? 0,
            namePlural: 'Subjects',
          }),
        },
      ],
    }
  }, [
    projectId,
    subprojectId,
    row?.id,
    row?.label,
    row?.chart_subjects_count,
    openNodes,
    loading,
  ])

  return { navData, loading }
}
