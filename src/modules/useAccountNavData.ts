import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'
import type Accounts from '../models/public/Accounts.ts'

// create type from Accounts with account_id as id and label only
type AccountNavData = {
  id: Accounts['account_id']
  label: Accounts['label']
}

const parentArray = ['data', 'accounts']
const parentUrl = `/${parentArray.join('/')}`

export const useAccountNavData = ({ accountId }) => {
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

  const nav: AccountNavData | undefined = res?.rows?.[0]
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

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
    nameSingular: 'Account',
  }

  return { loading, navData }
}
