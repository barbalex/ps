import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Users as User } from '../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'
// import fromElectricProvider from './ElectricProvider'

export const User = () => {
  const { db } = useElectric()!
  const { user_id } = useParams()
  const { results } = useLiveQuery(db.users.liveUnique({ user_id }))

  console.log('User, user_id', user_id)

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

  const users: User[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>User</div>
    </div>
  )
}
