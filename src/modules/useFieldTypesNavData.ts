import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import { fieldTypesFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useFieldTypesNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(fieldTypesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT field_type_id, label 
    FROM field_types 
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`)

  const loading = res === undefined

  const countResultUnfiltered = useLiveQuery(`SELECT count(*) FROM field_types`)
  const countUnfiltered = countResultUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = countResultUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = ['data']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'field-types']
    const ownUrl = `/${ownArray.join('/')}`

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
      toParams: {},
      label: `Field Types (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      navs,
    }
  }, [
    countLoading,
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    res?.rows,
  ])

  return { loading, navData, isFiltered, countLoading, countUnfiltered }
}
