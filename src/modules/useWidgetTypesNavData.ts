import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import { widgetTypesFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useWidgetTypesNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(widgetTypesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT widget_type_id, label 
    FROM widget_types
    ${isFiltered ? ` WHERE ${filterString}` : ''}
    ORDER BY label`)

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM widget_types`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = ['data']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'widget-types']
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
      label: `Widget Types (${
        isFiltered ?
          `${loading ? `...` : formatNumber(navs.length)}/${
            countLoading ? `...` : formatNumber(countUnfiltered)
          }`
        : loading ? `...`
        : formatNumber(navs.length)
      })`,
      nameSingular: 'Widget Type',
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

  return { loading, navData, isFiltered }
}
