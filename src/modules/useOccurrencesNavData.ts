import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

type NavData = {
  id: string
  label: string
}[]

export const useOccurrencesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
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
      o.occurrence_id AS id, 
      o.label 
    FROM occurrences o 
      INNER JOIN occurrence_imports oi on o.occurrence_import_id = oi.occurrence_import_id 
    WHERE ${filter} 
    ORDER BY label`,
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
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
    ...(isToAssess
      ? ['occurrences-to-assess']
      : isNotToAssign
        ? ['occurrences-not-to-assign']
        : ['occurrences']),
  ]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const namePlural = isToAssess
    ? ' Occurrences To Assess'
    : isNotToAssign
      ? 'Occurrences Not To Assign'
      : 'Occurrences Assigned'
  const nameSingular = isToAssess
    ? ' Occurrence to assess'
    : isNotToAssign
      ? 'Occurrence not to assign'
      : 'Occurrence assigned'

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered: navs.length,
      namePlural,
      loading,
    }),
    nameSingular,
    navs,
  }

  return { loading, navData }
}
