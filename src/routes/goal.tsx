import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { subproject_id, goal_id } = useParams()
  const { results } = useLiveQuery(
    db.goals.liveUnique({ where: { goal_id } }),
  )

  const addItem = async () => {
    await db.goals.create({
      data: {
        goal_id: uuidv7(),
        subproject_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.goals.deleteMany()
  }

  const goal: Goal = results

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
      <div>{`Goal with id ${
        goal?.goal_id ?? ''
      }`}</div>
    </div>
  )
}
