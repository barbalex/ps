import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  tableViewId?: string
  actionId: string
  actionQuantityId: string
}

type NavData = {
  id: string
  label: string
}

export const useActionQuantityNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  tableViewId,
  actionId,
  actionQuantityId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()

  const res = useLiveQuery<NavData>(
    `
      SELECT
        action_quantity_id as id,
        label
      FROM action_quantities 
      WHERE action_quantity_id = $1`,
    [actionQuantityId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    ...(tableViewId ? ['table-views', tableViewId] : []),
    'actions',
    actionId,
    'quantities',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, actionQuantityId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

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
    nameSingular: formatMessage({
      id: 'spP2/4',
      defaultMessage: 'Massnahmen-Wert',
    }),
  }

  return { loading, navData }
}
