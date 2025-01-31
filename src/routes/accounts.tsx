import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createAccount } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const results = useLiveQuery(`SELECT * FROM accounts`)
  const accounts = results?.rows ?? []

  const add = useCallback(async () => {
    const data = createAccount()
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into accounts (${columns}) values ($1)`
    await db.query(sql, values)
    navigate({
      pathname: data.account_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Accounts"
        addRow={add}
        tableName="account"
      />
      <div className="list-container">
        {accounts.map(({ account_id, label }) => (
          <Row
            key={account_id}
            label={label ?? account_id}
            to={`/data/accounts/${account_id}`}
          />
        ))}
      </div>
    </div>
  )
})
