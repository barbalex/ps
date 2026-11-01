import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import type Accounts from '../models/public/Accounts.ts'

// create type from Accounts with account_id as id and label only
type AccountNavData = {
  id: Accounts['account_id']
  label: Accounts['label']
}

type Props = {
  accountId: string
  userId?: string
}

export const useAccountNavData = ({ accountId, userId }: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT 
      account_id as id, 
      label 
    FROM 
      accounts 
    WHERE 
      account_id = $1`,
    [accountId],
  )
  const loading = res === undefined

  // project fields can be kept per account instead of inside the project
  // form; only then does the account get a fields folder (AccountNode port)
  const userRes = useLiveQuery(
    `SELECT project_fields_in_account FROM users WHERE user_id = $1`,
    [userId ?? null],
  )
  const showFieldsNav =
    !!userId && userRes?.rows?.[0]?.project_fields_in_account === false
  const fieldsCountRes = useLiveQuery(
    `SELECT count(*) FROM fields WHERE project_id IS NULL AND account_id = $1`,
    [accountId],
  )
  const fieldsCount = Number(fieldsCountRes?.rows?.[0]?.count ?? 0)

  const parentArray =
    userId ? ['data', 'users', userId, 'accounts'] : ['data', 'accounts']
  const parentUrl = `/${parentArray.join('/')}`

  const nav = res?.rows?.[0] as AccountNavData | undefined
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
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
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: formatMessage({ id: '9oKaIi', defaultMessage: 'Konto' }),
    navs:
      showFieldsNav ?
        [
          {
            id: 'project-fields',
            label: buildNavLabel({
              loading: fieldsCountRes === undefined,
              countFiltered: fieldsCount,
              namePlural: formatMessage({
                id: 'I+dTZE',
                defaultMessage: 'Felder',
              }),
            }),
          },
        ]
      : [],
  }

  return { loading, navData }
}
