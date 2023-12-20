import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id } = useParams<{
    subproject_id: string
    project_id: string
    place_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.place_users.liveMany())

  const add = async () => {
    await db.place_users.create({
      data: {
        place_user_id: uuidv7(),
        place_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.place_users.deleteMany()
  }

  const placeUsers: PlaceUser[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {placeUsers.map((placeUser: PlaceUser, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users/${placeUser.place_user_id}`}
          >
            {placeUser.place_user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
