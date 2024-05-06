import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createPlaceUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = () => {
  const { place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: placeUsers = [] } = useLiveQuery(
    db.place_users.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const placeUser = createPlaceUser()
    await db.place_users.create({
      data: {
        ...placeUser,
        place_id: place_id2 ?? place_id,
      },
    })
    navigate({
      pathname: placeUser.place_user_id,
      search: searchParams.toString(),
    })
  }, [db.place_users, navigate, place_id, place_id2, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Users" addRow={add} tableName="user" />
      <div className="list-container">
        {placeUsers.map(({ place_user_id, label }) => (
          <Row
            key={place_user_id}
            to={place_user_id}
            label={label ?? place_user_id}
          />
        ))}
      </div>
    </div>
  )
}
