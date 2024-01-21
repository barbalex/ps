import { useLiveQuery } from 'electric-sql/react'
import { useLocation } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Users as User } from '../../../generated/client'

export const Users = () => {
  const location = useLocation()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.users.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const users: User[] = results ?? []

  const usersNode = {
    label: `Users (${users.length})`,
  }

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'users'
  console.log('Users', { isOpen, urlPath })

  return (
    <>
      <Node node={usersNode} level={1} />
      {isOpen &&
        users.map((user) => <Node key={user.user_id} node={user} level={2} />)}
    </>
  )
}
