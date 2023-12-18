import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { SubprojectUser as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams<{
    subproject_id: string
    project_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.subproject_users.liveMany())

  const add = async () => {
    await db.subproject_users.create({
      data: {
        subproject_user_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.subproject_users.deleteMany()
  }

  const subproject_users: SubprojectUser[] = results ?? []

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
      {subproject_users.map(
        (subproject_user: SubprojectUser, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/users/${subproject_user.subproject_user_id}`}
            >
              {subproject_user.subproject_user_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
