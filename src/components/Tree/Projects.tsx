import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ProjectNode } from './Project/index.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeOpenNodes } from '../../modules/tree/removeOpenNodes.ts'

type Props = {
  openNodes: string[][]
  userEmail: string
}

export const ProjectsNode = memo(({ openNodes, userEmail }: Props) => {
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
      removeOpenNodes({
        nodes: [['projects']],
        db,
        userEmail,
      })
      return navigate({ pathname: '/', search: searchParams.toString() })
    }
    addOpenNodes({
      nodes: [['projects']],
      db,
      userEmail,
    })
    navigate({ pathname: '/projects', search: searchParams.toString() })
  }, [db, isOpen, navigate, searchParams, userEmail])

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
          <ProjectNode
            key={project.project_id}
            project={project}
            openNodes={openNodes}
            userEmail={userEmail}
          />
        ))}
    </>
  )
})
