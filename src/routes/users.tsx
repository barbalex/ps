import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Users as User } from '../../../generated/client'
import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.users.liveMany())

  const add = useCallback(async () => {
    const data = createUser()
    await db.users.create({ data })
    navigate(`/users/${data.user_id}`)
  }, [db.users, navigate])

  const users: User[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="user" />
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
