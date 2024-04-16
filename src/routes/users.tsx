import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: users = [] } = useLiveQuery(
    db.users.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = await createUser({ db })

    navigate({ pathname: data.user_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  // console.log('hello users')

  return (
    <div className="list-view">
      <ListViewHeader title="Users" addRow={add} tableName="user" />
      <div className="list-container">
        {users.map(({ user_id, label }) => (
          <Row key={user_id} label={label ?? user_id} to={user_id} />
        ))}
      </div>
    </div>
  )
}
