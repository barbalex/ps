import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ProjectNode } from './Project'

export const ProjectsNode = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: projects = [] } = useLiveQuery(
    db.projects.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const projectsNode = useMemo(
    () => ({ label: `Projects (${projects.length})` }),
    [projects.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = urlPath[0] === 'projects'
  const isActive = isOpen && urlPath.length === 1

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    navigate({ pathname: '/projects', search: searchParams.toString() })
  }, [isOpen, navigate, searchParams])

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
})
