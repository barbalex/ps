import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { account_id } = useParams()
  const { results } = useLiveQuery(
    db.accounts.liveUnique({ where: { account_id } }),
  )

  const addItem = async () => {
    await db.accounts.create({
      data: {
        account_id: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.accounts.deleteMany()
  }

  const account: Account = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Account with id ${account?.account_id ?? ''}`}</div>
    </div>
  )
}
