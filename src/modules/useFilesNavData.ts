import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
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

  const sql = `
    SELECT file_id, label, url, mimetype 
    FROM files 
    WHERE
        ${hKey ? `${hKey} = '${hValue}'` : 'true'} 
        ${isFiltered ? `AND ${filterString}` : ''} 
    ORDER BY label`
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `
        SELECT count(*) 
        FROM files 
        WHERE ${hKey ? `${hKey} = '${hValue}'` : 'true'} `,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      ...(projectId ? ['projects', projectId] : []),
      ...(subprojectId ? ['subprojects', subprojectId] : []),
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
      ...(actionId ? ['actions', actionId] : []),
      ...(checkId ? ['checks', checkId] : []),
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'files']
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      // level: 1,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      toParams: {},
      label: `Files (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      nameSingular: 'File',
      navs,
    }
  }, [
    actionId,
    checkId,
    countLoading,
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
