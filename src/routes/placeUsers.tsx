import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPlaceUser } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_users.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
      }),
    [place_id, place_id2],
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

  const placeUsers: PlaceUser[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="place user" />
      {placeUsers.map((placeUser: PlaceUser, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/users/${placeUser.place_user_id}`}
          >
            {placeUser.label ?? placeUser.place_user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
