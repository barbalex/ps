import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useChartsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  let hKey
  let hValue
  if (placeId2) {
    hKey = 'place_id2'
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

  const res = useLiveQuery(
    `SELECT * FROM charts WHERE ${hKey} = $1 ORDER BY label`,
    [hValue],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
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
      toParams: {},
      label: `Charts (${loading ? '...' : formatNumber(navs.length)})`,
      nameSingular: 'Chart',
      navs,
    }
  }, [
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
