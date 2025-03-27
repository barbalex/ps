import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { widgetsForFieldsFilterAtom } from '../store.ts'

export const useWidgetsForFieldsNavData = () => {
  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT 
      widget_for_field_id, 
      label 
    FROM widgets_for_fields
    ${isFiltered ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`)

  const isLoading = res === undefined
  const navData = res?.rows ?? []

  return { isLoading, navData, isFiltered }
}
