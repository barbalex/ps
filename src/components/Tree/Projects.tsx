import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Projects as Project } from '../../../generated/client'
import { ProjectNode } from './Project'

export const ProjectsNode = () => {
  const location = useLocation()
  const navigate = useNavigate()

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
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    console.log('onClickLabel', { isParentOpen: isOpen })
    if (isOpen) return navigate('/')
    navigate('/projects')
  }, [isOpen, navigate])

  return (
    <>
      <Node
        node={projectsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projects.length}
        to={`/projects`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projects.map((project) => (
          <ProjectNode key={project.project_id} project={project} />
        ))}
    </>
  )
}
