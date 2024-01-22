import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { Users as User } from '../../../generated/client'
import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.users.liveMany({ where: { deleted: false }, orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = createUser()
    await db.users.create({ data })
    navigate(`/users/${data.user_id}`)
  }, [db.users, navigate])

  const users: User[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Users" addRow={add} tableName="user" />
      <div className="list-container">
        {users.map(({ user_id, label }) => (
          <Row key={user_id} label={label} to={`/users/${user_id}`} />
        ))}
      </div>
    </div>
  )
}
