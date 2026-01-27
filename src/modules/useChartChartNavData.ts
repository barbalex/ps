import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  chartId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useChartChartNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  chartId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      SELECT
        chart_id AS id,
        title AS label
      FROM 
        charts
      WHERE 
        charts.chart_id = '${chartId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    'charts',
    chartId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'chart']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : 'Chart'

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
