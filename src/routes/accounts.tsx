import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.accounts.liveMany())

  const add = async () => {
    await db.accounts.create({
      data: {
        account_id: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.accounts.deleteMany()
  }

  const accounts: Account[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {accounts.map((account: Account, index: number) => (
        <p key={index} className="item">
          <Link to={`/accounts/${account.account_id}`}>{account.account_id}</Link>
        </p>
      ))}
    </div>
  )
}
