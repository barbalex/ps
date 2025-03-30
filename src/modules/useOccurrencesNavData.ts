import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useOccurrencesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  let filter = `oi.subproject_id = '${subprojectId}'`
  if (isToAssess) {
    filter += ' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL'
  } else if (isNotToAssign) {
    filter += ' AND o.not_to_assign IS TRUE AND o.place_id IS NULL'
  } else if (!!placeId || !!placeId2) {
    filter += ` AND o.place_id = '${placeId2 ?? placeId}'`
  }

  const res = useLiveQuery(
    `
    SELECT 
      o.occurrence_id, 
      o.label 
    FROM occurrences o 
      INNER JOIN occurrence_imports oi on o.occurrence_import_id = oi.occurrence_import_id 
    WHERE ${filter} 
    ORDER BY label`,
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [
      ...parentArray,
      ...(isToAssess ? ['occurrences-to-assess']
      : isNotToAssign ? ['occurrences-not-to-assign']
      : ['occurrences']),
    ]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)
    const namePlural =
      isToAssess ? ' Occurrences to assess'
      : isNotToAssign ? 'Occurrences not to assign'
      : 'Occurrences assigned'
    const nameSingular =
      isToAssess ? ' Occurrence to assess'
      : isNotToAssign ? 'Occurrence not to assign'
      : 'Occurrence assigned'

    console.log('useOccurrencesNavData', {
      isToAssess,
      isNotToAssign,
      projectId,
      subprojectId,
      placeId,
      placeId2,
      navs,
      filter,
      parentArray,
      parentUrl,
      ownArray,
      ownUrl,
    })

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      toParams: {},
      label: `${namePlural} (${loading ? '...' : formatNumber(navs.length)})`,
      nameSingular,
      navs,
    }
  }, [
    isNotToAssign,
    isToAssess,
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
