import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createAccount } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
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
          <Row key={account_id} label={label} to={`/accounts/${account_id}`} />
        ))}
      </div>
    </div>
  )
}
