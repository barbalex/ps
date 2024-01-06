import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'
import { account as createAccount } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.accounts.liveMany())

  const add = useCallback(async () => {
    const data = createAccount()
    await db.accounts.create({ data })
    navigate(`/accounts/${data.account_id}`)
  }, [db.accounts, navigate])

  const accounts: Account[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="account" />
      {accounts.map((account: Account, index: number) => (
        <p key={index} className="item">
          <Link to={`/accounts/${account.account_id}`}>
            {account.label ?? account.account_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
