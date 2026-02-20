import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  placeUsers1FilterAtom,
  placeUsers2FilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

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

export const usePlaceUsersNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(
    placeId2 ? placeUsers2FilterAtom : placeUsers1FilterAtom,
  )
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

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
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'users']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM place_users WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM place_users WHERE place_id = '${placeId2 ?? placeId}'${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        place_user_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM place_users 
      , count_unfiltered, count_filtered
      WHERE place_id = '${placeId2 ?? placeId}'
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label`
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM place_users WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM place_users WHERE place_id = '${placeId2 ?? placeId}'${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
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
      isFiltered,
      namePlural: 'Users',
      loading,
    }),
    nameSingular: 'User',
    navs,
  }

  return { loading, navData, isFiltered }
}
