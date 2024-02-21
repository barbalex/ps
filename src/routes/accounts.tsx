import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'
import { createAccount } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { useElectric } from '../ElectricProvider'

import '../form.css'

type AccountResults = {
  results: Account[]
}

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: accounts = [] }: AccountResults = useLiveQuery(
    db.accounts.liveMany(),
  )

  const add = useCallback(async () => {
    const data = createAccount()
    await db.accounts.create({ data })
    navigate(`/accounts/${data.account_id}`)
  }, [db.accounts, navigate])

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
