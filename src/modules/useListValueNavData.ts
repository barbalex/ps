import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useListValueNavData = ({ projectId, listId, listValueId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        list_value_id,
        label 
      FROM list_values 
      WHERE list_value_id = $1`,
    [listValueId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const parentArray = [
      'data',
      'projects',
      projectId,
      'lists',
      listId,
      'values',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, listValueId]
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
      label: nav?.label ?? nav?.id,
      nameSingular: 'List Value',
    }
  }, [listId, listValueId, location.pathname, openNodes, projectId, res?.rows])

  return { loading, navData }
}
