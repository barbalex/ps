import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filesFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useFilesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = useMemo(
    () => [
      'data',
      ...(projectId ? ['projects', projectId] : []),
      ...(subprojectId ? ['subprojects', subprojectId] : []),
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
      ...(actionId ? ['actions', actionId] : []),
      ...(checkId ? ['checks', checkId] : []),
    ],
    [actionId, checkId, placeId, placeId2, projectId, subprojectId],
  )
  const ownArray = useMemo(() => [...parentArray, 'files'], [parentArray])
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const { hKey, hValue } = useMemo(() => {
    if (actionId) {
      return { hKey: 'action_id', hValue: actionId }
    } else if (checkId) {
      return { hKey: 'check_id', hValue: checkId }
    } else if (placeId2) {
      return { hKey: 'place_id2', hValue: placeId2 }
    } else if (placeId) {
      return { hKey: 'place_id', hValue: placeId }
    } else if (subprojectId) {
      return { hKey: 'subproject_id', hValue: subprojectId }
    } else if (projectId) {
      return { hKey: 'project_id', hValue: projectId }
    }
    return { hKey: undefined, hValue: undefined }
  }, [actionId, checkId, placeId, placeId2, projectId, subprojectId])

  const [filter] = useAtom(filesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
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

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const countUnfiltered = navs[0]?.count_unfiltered ?? 0
    const countFiltered = navs[0]?.count_filtered ?? 0

    const parentUrl = `/${parentArray.join('/')}`
    const ownUrl = `/${ownArray.join('/')}`
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
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
  }, [
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    ownArray,
    parentArray,
    res?.rows,
  ])

  return { loading, navData }
}
