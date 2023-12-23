import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Users as User } from '../../../generated/client'
import { user as createUserPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.users.liveMany())

  const add = useCallback(async () => {
    const newUser = createUserPreset()
    await db.users.create({
      data: newUser,
    })
    navigate(`/users/${newUser.user_id}`)
  }, [db.users, navigate])

  const users: User[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {users.map((user: User, index: number) => (
        <p key={index} className="item">
          <Link to={`/users/${user.user_id}`}>
            {user.label ?? user.user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
