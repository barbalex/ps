import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  placeReports1FilterAtom,
  placeReports2FilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

export const usePlaceReportsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const ownArray = [...parentArray, 'reports']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const [filter] = useAtom(
    placeId2 ? placeReports2FilterAtom : placeReports1FilterAtom,
  )
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        place_report_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM place_reports, count_unfiltered, count_filtered
      WHERE
        place_id = '${placeId2 ?? placeId}'
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
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
      loading,
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural: 'Reports',
    }),
    nameSingular: 'Report',
    navs,
  }

  return { loading, navData, isFiltered }
}
