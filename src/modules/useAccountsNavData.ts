import { useLiveQuery } from '@electric-sql/pglite-react'

export const useAccountsNavData = () => {
  const res = useLiveQuery(
    `SELECT account_id, label FROM accounts ORDER BY label`,
  )
  const loading = res === undefined
  const navData = res?.rows ?? []

  return { loading, navData }
}
