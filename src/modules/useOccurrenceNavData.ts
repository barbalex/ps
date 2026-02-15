import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  occurrenceId: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

type NavData = {
  id: string
  label: string | null
}

export const useOccurrenceNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  occurrenceId,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
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

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    ...(isToAssess
      ? ['occurrences-to-assess']
      : isNotToAssign
        ? ['occurrences-not-to-assign']
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
  const nameSingular = isToAssess
    ? ' Occurrence To Assess'
    : isNotToAssign
      ? 'Occurrence Not To Assign'
      : 'Occurrence Assigned'

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
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

  return { loading, navData }
}
