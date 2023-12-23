import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeUser as createPlaceUserPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_users.liveMany({ where: { place_id, deleted: false } }),
    [place_id],
  )

  const add = async () => {
    const newPlaceUser = createPlaceUserPreset()
    await db.place_users.create({
      data: {
        ...newPlaceUser,
        place_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users/${newPlaceUser.place_user_id}`,
    )
  }

  const placeUsers: PlaceUser[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {placeUsers.map((placeUser: PlaceUser, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users/${placeUser.place_user_id}`}
          >
            {placeUser.label ?? placeUser.place_user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
