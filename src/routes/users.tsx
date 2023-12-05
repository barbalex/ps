import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'

import { Users as User } from '../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Users = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.users.liveMany())

  const add = async () => {
    await db.users.create({
      data: {
        user_id: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.users.deleteMany()
  }

  const users: User[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {users.map((user: User, index: number) => (
        <p key={index} className="item">
          <code>{user.user_id}</code>
        </p>
      ))}
    </div>
  )
}
