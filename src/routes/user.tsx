import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Users as User } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { user_id } = useParams()
  const { results } = useLiveQuery(db.users.liveUnique({ where: { user_id } }))

  const addItem = async () => {
    await db.users.create({
      data: {
        user_id: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.users.deleteMany()
  }

  const user: User = results

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
      <div>{`User with id ${user?.user_id ?? ''}`}</div>
    </div>
  )
}
