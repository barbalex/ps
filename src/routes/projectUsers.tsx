import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { projectUser as createProjectUserPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.project_users.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = async () => {
    const newProjectUser = createProjectUserPreset()
    await db.project_users.create({
      data: {
        ...newProjectUser,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/users/${newProjectUser.project_user_id}`)
  }

  const clear = async () => {
    await db.project_users.deleteMany()
  }

  const projectUsers: ProjectUser[] = results ?? []

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
      {projectUsers.map((projectUser: ProjectUser, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/users/${projectUser.project_user_id}`}
          >
            {projectUser.label ?? projectUser.project_user_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
