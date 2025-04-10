import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'users']
const ownUrl = `/${ownArray.join('/')}`

export const useUserNavData = ({ userId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT 
      user_id AS id, 
      label 
    FROM users
    WHERE user_id = $1`,
    [userId],
  )
  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
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
      nameSingular: 'User',
    }
  }, [location.pathname, openNodes, res])

  return { loading, navData }
}
