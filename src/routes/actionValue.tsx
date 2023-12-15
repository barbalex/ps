import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ActionValues as ActionValue } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { action_id, action_value_id } = useParams()
  const { results } = useLiveQuery(
    db.action_values.liveUnique({ where: { action_value_id } }),
  )

  const addItem = async () => {
    await db.action_values.create({
      data: {
        action_value_id: uuidv7(),
        action_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.action_values.deleteMany()
  }

  const actionValue: ActionValue = results

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
      <div>{`Action Value with id ${actionValue?.action_value_id ?? ''}`}</div>
    </div>
  )
}
