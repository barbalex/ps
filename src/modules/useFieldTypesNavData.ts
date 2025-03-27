import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { fieldTypesFilterAtom } from '../store.ts'

export const useFieldTypesNavData = () => {
  const [filter] = useAtom(fieldTypesFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT field_type_id, label 
    FROM field_types 
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`)

  const loading = res === undefined
  const navData = res?.rows ?? []

  return { loading, navData, isFiltered }
}
