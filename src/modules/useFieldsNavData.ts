import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { fieldsFilterAtom } from '../store.ts'

export const useFieldsNavData = ({ projectId }) => {
  const [filter] = useAtom(fieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT field_id, label 
    FROM fields 
    WHERE 
      project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}
      ${filterString ? ` AND ${filterString}` : ''} 
    ORDER BY table_name, name, level`)

  const isLoading = res === undefined
  const navData = res?.rows ?? []

  return { isLoading, navData, isFiltered }
}
