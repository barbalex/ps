import { useLiveQuery } from '@electric-sql/pglite-react'

export const useAccountsNavData = () => {
  const res = useLiveQuery(`SELECT account_id, label FROM accounts`)
  const isLoading = res === undefined
  const navData = res?.rows ?? []

  return { isLoading, navData }
}
