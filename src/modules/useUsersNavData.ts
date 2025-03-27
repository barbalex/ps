import { useLiveQuery } from '@electric-sql/pglite-react'

export const useUsersNavData = () => {
  const res = useLiveQuery(`SELECT user_id, label FROM users ORDER BY label`)
  const loading = res === undefined
  const navData = res?.rows ?? []

  return { loading, navData }
}
