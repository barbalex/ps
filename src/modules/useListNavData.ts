import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useListNavData = ({ projectId, listId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    WITH
      list_values_count AS (SELECT COUNT(*) AS count FROM list_values WHERE list_id = '${listId}')
    SELECT
      list_id AS id,
      label,
      list_values_count.count AS list_values_count_unfiltered
    FROM
      lists, 
      list_values_count
    WHERE
      lists.list_id = '${listId}'`,
  )

  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects', projectId, 'lists']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
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
      label: row?.label,
      nameSingular: 'List',
      navs: [
        { id: 'list', label: 'List' },
        {
          id: 'values',
          label: buildNavLabel({
            loading,
            countFiltered: row?.list_values_count_unfiltered ?? 0,
            namePlural: 'Values',
          }),
        },
      ],
    }
  }, [
    loading,
    location.pathname,
    openNodes,
    projectId,
    row?.id,
    row?.label,
    row?.list_values_count_unfiltered,
  ])

  return { loading, navData }
}
