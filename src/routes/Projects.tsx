import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { Projects as Project } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../../User.css'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.projects.liveMany())

  const add = async () => {
    await db.projects.create({
      data: {
        project_id: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.projects.deleteMany()
  }

  const projects: Project[] = results ?? []

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
