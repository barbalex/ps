import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { chartsFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useChartsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(chartsFilterAtom)
  const location = useLocation()

  let hKey
  let hValue
  if (placeId2) {
    hKey = 'place_id'
    hValue = placeId2
  } else if (placeId) {
    hKey = 'place_id'
    hValue = placeId
  } else if (subprojectId) {
    hKey = 'subproject_id'
    hValue = subprojectId
  } else if (projectId) {
    hKey = 'project_id'
    hValue = projectId
  }

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'charts']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = `
    ${
      isOpen
        ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM charts WHERE ${hKey} = '${hValue}'),
        count_filtered AS (SELECT count(*) FROM charts WHERE ${hKey} = '${hValue}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        chart_id as id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM charts, count_unfiltered, count_filtered
      WHERE ${hKey} = '${hValue}'
      ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
        : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM charts WHERE ${hKey} = '${hValue}'),
        count_filtered AS (SELECT count(*) FROM charts WHERE ${hKey} = '${hValue}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
    }
  `

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
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
      countFiltered,
      countUnfiltered,
      namePlural: 'Charts',
      loading,
      isFiltered,
    }),
    nameSingular: 'Chart',
    navs,
  }

  return { loading, navData, isFiltered }
}
