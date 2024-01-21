import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { Node } from '../Node'
import { Projects as Project } from '../../../../generated/client'

export const Projects = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.projects.liveMany({
      where: { deleted: false },
      orderBy: [{ name: 'asc' }, { project_id: 'asc' }],
    }),
  )
  const projects: Project[] = results ?? []

  console.log('projects', projects)

  return (projects ?? []).map((project) => (
    <Node key={project.project_id} node={project} level={1} />
  ))
}
