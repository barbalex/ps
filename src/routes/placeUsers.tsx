import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createPlaceUser } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: placeUsers = [] } = useLiveQuery(
    db.place_users.liveMany({
      where: { place_id: place_id2 ?? place_id, deleted: false },
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
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/users/${placeUser.place_user_id}`,
    )
  }, [db.place_users, navigate, place_id, place_id2, project_id, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader title="Users" addRow={add} tableName="user" />
      <div className="list-container">
        {placeUsers.map(({ place_user_id, label }) => (
          <Row
            key={place_user_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/users/${place_user_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
