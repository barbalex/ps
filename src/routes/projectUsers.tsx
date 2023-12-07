import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.project_users.liveMany())

  const add = async () => {
    await db.project_users.create({
      data: {
        project_user_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.project_users.deleteMany()
  }

  const projectUsers: ProjectUser[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {projectUsers.map((projectUser: ProjectUser, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/users/${projectUser.project_user_id}`}
          >
            {projectUser.project_user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
