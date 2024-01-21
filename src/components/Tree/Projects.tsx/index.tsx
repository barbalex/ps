import { useLiveQuery } from 'electric-sql/react'
import { useLocation } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider'
import { Node } from '../Node'
import { Projects as Project } from '../../../../generated/client'

export const Projects = () => {
  const location = useLocation()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.projects.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )
  const projects: Project[] = results ?? []

  const projectsNode = {
    label: `Projects (${projects.length})`,
  }

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'projects'

  return (
    <>
      <Node node={projectsNode} level={1} />
      {isOpen &&
        projects.map((project) => (
          <Node key={project.project_id} node={project} level={2} />
        ))}
    </>
  )
}
