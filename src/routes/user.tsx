import React, { useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'

import { Users as User } from '../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'
// import fromElectricProvider from './ElectricProvider'

export const User = () => {
  const { db } = useElectric()!
  console.log('User db:', db)
  const { results } = useLiveQuery(db.users.liveMany())

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.users.sync()

      // Resolves when the data has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [])

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
      {users.map((user: User, index: number) => (
        <p key={index} className="item">
          <code>{user.user_id}</code>
        </p>
      ))}
    </div>
  )
}
