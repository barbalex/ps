import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

const parentArray = ['data', 'users']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  userId: string
}

type NavData = {
  id: string
  label: string | null
  accounts_in_user: boolean | null
  accounts_count: number
}

export const useUserNavData = ({ userId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
    SELECT 
      user_id AS id, 
      label,
      accounts_in_user,
      (SELECT count(*) FROM accounts WHERE accounts.user_id = users.user_id) AS accounts_count
    FROM users
    WHERE user_id = $1`,
    [userId],
  )
  const loading = res === undefined

  const nav = res?.rows?.[0] as NavData | undefined
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [...parentArray, nav?.id ?? userId]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' }) : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' }),
    // accounts are listed inside the user form unless accounts_in_user is off
    navs:
      nav && nav.accounts_in_user !== true ?
        [
          {
            id: 'accounts',
            label: buildNavLabel({
              loading,
              countFiltered: Number(nav.accounts_count ?? 0),
              namePlural: formatMessage({
                id: '/40i9A',
                defaultMessage: 'Konten',
              }),
            }),
          },
        ]
      : [],
  }

  return { loading, navData }
}
