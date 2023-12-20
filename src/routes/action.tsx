import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { place_id, action_id } = useParams()
  const { results } = useLiveQuery(
    db.actions.liveUnique({ where: { action_id } }),
  )

  const addItem = async () => {
    await db.actions.create({
      data: {
        action_id: uuidv7(),
        place_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.actions.deleteMany()
  }

  const action: Action = results

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
      <div>{`Action with id ${action?.action_id ?? ''}`}</div>
    </div>
  )
}
