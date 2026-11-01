import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filesScopeWhere } from './filesScopeWhere.ts'
import { filesFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  actionId?: string
  checkId?: string
  filteredViewId?: string
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
  filteredViewId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    ...(actionId ? ['actions', actionId] : []),
    ...(checkId
      ? [...(filteredViewId ? ['filtered-checks', filteredViewId] : []), 'checks', checkId]
      : []),
  ]
  const ownArray = [...parentArray, 'files']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const scope = filesScopeWhere({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
  })

  const [filter] = useAtom(filesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM files WHERE ${scope}),
        count_filtered AS (SELECT count(*) FROM files WHERE ${scope} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        file_id AS id,
        label,
        url,
        mimetype,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM files, count_unfiltered, count_filtered
      WHERE ${scope}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM files WHERE ${scope}),
        count_filtered AS (SELECT count(*) FROM files WHERE ${scope} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery<NavDataOpen[number]>(sql)

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
      namePlural: formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' }),
    }),
    nameSingular: formatMessage({ id: '9Gu1cL', defaultMessage: 'Datei' }),
    navs,
  }

  return { loading, navData, isFiltered }
}
