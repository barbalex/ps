import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useListValuesNavData = ({ projectId, listId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        list_value_id,
        label 
      FROM list_values 
      WHERE list_id = $1 
      ORDER BY label`,
    [listId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = ['data', 'projects', projectId, 'lists', listId]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'values']
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      toParams: {},
      label: `Values (${loading ? '...' : formatNumber(navs.length)})`,
      nameSingular: 'List Value',
      navs,
    }
  }, [listId, loading, location.pathname, openNodes, projectId, res?.rows])

  return { loading, navData }
}
