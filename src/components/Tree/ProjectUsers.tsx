import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node'
import { ProjectUserNode } from './ProjectUser'

interface Props {
  project_id: string
  level?: number
}

export const ProjectUsersNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: projectUsers = [] } = useLiveQuery(
    db.project_users.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const projectUsersNode = useMemo(
    () => ({ label: `Users (${projectUsers.length})` }),
    [projectUsers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'users'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({ pathname: `${baseUrl}/users`, search: searchParams.toString() })
  }, [baseUrl, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={projectUsersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projectUsers.length}
        to={`${baseUrl}/users`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projectUsers.map((projectUser) => (
          <ProjectUserNode
            key={projectUser.project_user_id}
            project_id={project_id}
            projectUser={projectUser}
          />
        ))}
    </>
  )
})
