import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'users']
const ownUrl = `/${ownArray.join('/')}`

export const useUsersNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(`
    SELECT 
      user_id AS id, 
      label 
    FROM users 
    ORDER BY label`)
  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
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
        namePlural: 'Users',
        loading,
      }),
      nameSingular: 'User',
      navs,
    }
  }, [loading, location.pathname, openNodes, res?.rows])

  return { loading, navData }
}
