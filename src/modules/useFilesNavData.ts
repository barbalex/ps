import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filesFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  actionId?: string
  checkId?: string
}

type NavDataOpen = {
  id: string
  label: string
  url: string
  mimetype: string
  count_unfiltered?: number
  count_filtered?: number
}[]

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}[]

export const useFilesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    ...(actionId ? ['actions', actionId] : []),
    ...(checkId ? ['checks', checkId] : []),
  ]
  const ownArray = [...parentArray, 'files']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const hKey = actionId
    ? 'action_id'
    : checkId
      ? 'check_id'
      : placeId2
        ? 'place_id'
        : placeId
          ? 'place_id'
          : subprojectId
            ? 'subproject_id'
            : projectId
              ? 'project_id'
              : undefined

  const hValue =
    actionId ??
    checkId ??
    placeId2 ??
    placeId ??
    subprojectId ??
    projectId ??
    undefined

  const [filter] = useAtom(filesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM files WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'}),
        count_filtered AS (SELECT count(*) FROM files WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        file_id AS id,
        label,
        url,
        mimetype,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM files, count_unfiltered, count_filtered
      WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM files WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'}),
        count_filtered AS (SELECT count(*) FROM files WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavDataOpen | NavDataClosed = res?.rows ?? []
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
      namePlural: 'Files',
    }),
    nameSingular: 'File',
    navs,
  }

  return { loading, navData, isFiltered }
}
