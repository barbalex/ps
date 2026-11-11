import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { createElement } from 'react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'
import { AbsenzBadge } from '../components/shared/AbsenzBadge.tsx'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  observationId: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

type NavData = {
  id: string
  label: string | null
  is_absenz?: boolean | null
}

export const useObservationNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  observationId,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData>(
    `
    SELECT
      observation_id AS id,
      label,
      absence AS is_absenz
    FROM observations
    WHERE observation_id = $1`,
    [observationId],
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
      ? ['observations-to-assess']
      : isNotToAssign
        ? ['observations-not-to-assign']
        : ['observations']),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, observationId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const nameSingular = isToAssess
    ? formatMessage({
        id: 'tfUHK5',
        defaultMessage: 'zu beurteilende Beobachtung',
      })
    : isNotToAssign
      ? formatMessage({
          id: 'aanYYz',
          defaultMessage: 'nicht zuzuordnende Beobachtung',
        })
      : formatMessage({
          id: 'gKq4qF',
          defaultMessage: 'zugeordnete Beobachtung',
        })

  const notFound = !!res && !nav
  const labelText = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)
  // Absenzen carry their label plus the red badge — as elements, so the
  // badge stays translated (label strings are stored data)
  const label = nav?.is_absenz ?
      [labelText, ' ', createElement(AbsenzBadge)]
    : labelText

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
