import { useLiveQuery } from 'electric-sql/react'
import { Link } from 'react-router-dom'

import { Projects as Project } from '../../../generated/client'
import { project as projectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.projects.liveMany({ where: { deleted: false } }),
  )

  const add = async () => {
    await db.projects.create({
      data: projectPreset,
    })
  }

  const clear = async () => {
    await db.projects.deleteMany()
  }

  const projects: Project[] = results ?? []

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
      {projects.map((project: Project, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project.project_id}`}>
            {project.project_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
