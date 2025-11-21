import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'accounts']
const ownUrl = `/${ownArray.join('/')}`

export const useAccountsNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `SELECT account_id as id, label FROM accounts ORDER BY label`,
  )
  const loading = res === undefined

  const navs = res?.rows ?? []
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label: buildNavLabel({
      countFiltered: navs.length,
      namePlural: 'Accounts',
      loading,
    }),
    nameSingular: 'Account',
    navs,
  }

  return { loading, navData }
}
