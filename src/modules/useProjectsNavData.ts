import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { projectsFilterAtom } from '../store.ts'

export const useProjectsNavData = () => {
  const [filter] = useAtom(projectsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT
      project_id,
      label 
    FROM projects
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`)

  const loading = res === undefined
  const navData = res?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(`SELECT count(*) FROM projects`)
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  return { loading, navData, isFiltered, countUnfiltered, countLoading }
}
