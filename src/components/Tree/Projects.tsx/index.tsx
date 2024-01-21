import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider'
import { Node } from '../Node'
import { Projects as Project } from '../../../../generated/client'

export const Projects = () => {
  const location = useLocation()
  const params = useParams()
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
  const isParentOpen = urlPath[0] === 'projects'

  const onClickButton = useCallback(() => {
    console.log('onClickLabel', { isParentOpen })
    if (isParentOpen) return navigate('/')
    navigate('/projects')
  }, [isParentOpen, navigate])

  return (
    <>
      <Node
        node={projectsNode}
        level={1}
        isOpen={isParentOpen}
        childrenCount={projects.length}
        to={`/projects`}
        onClickButton={onClickButton}
      />
      {isParentOpen &&
        projects.map((project) => (
          <Node
            key={project.project_id}
            node={project}
            level={2}
            isOpen={isParentOpen && params?.project_id === project.project_id}
            to={`/projects/${project.project_id}`}
          />
        ))}
    </>
  )
}
