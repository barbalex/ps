import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

export const useOccurrenceNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  occurrenceId,
  isToAssess = false,
  isNotToAssign = false,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT 
      occurrence_id AS id, 
      label 
    FROM occurrences
    WHERE occurrence_id = $1`,
    [occurrenceId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
      ...(isToAssess ? ['occurrences-to-assess']
      : isNotToAssign ? ['occurrences-not-to-assign']
      : ['occurrences']),
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, occurrenceId]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)
    const nameSingular =
      isToAssess ? ' Occurrence To Assess'
      : isNotToAssign ? 'Occurrence Not To Assign'
      : 'Occurrence Assigned'

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      nameSingular,
    }
  }, [
    isNotToAssign,
    isToAssess,
    location.pathname,
    occurrenceId,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res,
    subprojectId,
  ])

  return { loading, navData }
}
