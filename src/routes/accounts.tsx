import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createAccount } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { useElectric } from '../ElectricProvider.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: accounts = [] } = useLiveQuery(db.accounts.liveMany())

  const add = useCallback(async () => {
    const data = createAccount()
    await db.accounts.create({ data })
    navigate({
      pathname: data.account_id,
      search: searchParams.toString(),
    })
  }, [db.accounts, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Accounts" addRow={add} tableName="account" />
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
