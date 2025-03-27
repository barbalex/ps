import { useLiveQuery } from '@electric-sql/pglite-react'

export const useCrssNavData = () => {
  const res = useLiveQuery(`
    SELECT 
      crs_id, 
      label 
    FROM crs 
    ORDER BY label`)

  const isLoading = res === undefined
  const navData = res?.rows ?? []

  return { isLoading, navData }
}
