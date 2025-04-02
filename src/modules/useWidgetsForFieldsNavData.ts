import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { widgetsForFieldsFilterAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'widgets-for-fields']
const ownUrl = `/${ownArray.join('/')}`

export const useWidgetsForFieldsNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT 
      widget_for_field_id AS id,
      label 
    FROM widgets_for_fields
    ${isFiltered ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`)

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM widgets_for_fields`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

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
        loading,
        isFiltered,
        countFiltered: navs.length,
        countUnfiltered,
        namePlural: 'Widgets For Fields',
      }),
      nameSingular: 'Widget For Field',
      navs,
    }
  }, [
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
