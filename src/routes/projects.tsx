import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Projects as Project } from '../../../generated/client'
import { project as createProjectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.projects.liveMany({
      where: { deleted: false },
      orderBy: [{ name: 'asc' }, { project_id: 'asc' }],
    }),
  )

  const add = useCallback(async () => {
    const newProject = createProjectPreset()
    await db.projects.create({
      data: newProject,
    })
    navigate(`/projects/${newProject.project_id}`)
  }, [db.projects, navigate])

  const projects: Project[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="project" />
      {projects.map((project: Project, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project.project_id}`}>
            {project.label ?? project.project_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
