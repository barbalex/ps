import { useLiveQuery } from '@electric-sql/pglite-react'

export const useMessagesNavData = () => {
  const res = useLiveQuery(
    `SELECT message_id, date FROM messages order by date desc`,
  )

  const loading = res === undefined
  const navData = res?.rows ?? []

  return { loading, navData }
}
