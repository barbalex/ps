import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { widgetTypesFilterAtom } from '../store.ts'

export const useWidgetTypesNavData = () => {
  const [filter] = useAtom(widgetTypesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT widget_type_id, label 
    FROM widget_types
    ${isFiltered ? ` WHERE ${filterString}` : ''}
    ORDER BY label`)

  const isLoading = res === undefined
  const navData = res?.rows ?? []

  return { isLoading, navData, isFiltered }
}
