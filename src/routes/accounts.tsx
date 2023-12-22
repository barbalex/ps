import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'
import { account as createAccountPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.accounts.liveMany())

  const add = async () => {
    const newAccount = createAccountPreset()
    await db.accounts.create({
      data: newAccount,
    })
    navigate(`/accounts/${newAccount.account_id}`)
  }

  const accounts: Account[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
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
