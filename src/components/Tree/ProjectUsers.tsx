import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { ProjectUserNode } from './ProjectUser'

export const ProjectUsersNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.project_users.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const projectUsers: ProjectUser[] = results ?? []

  const projectUsersNode = useMemo(
    () => ({
      label: `Project Users (${projectUsers.length})`,
    }),
    [projectUsers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'users'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/users`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={projectUsersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projectUsers.length}
        to={`/projects/${project_id}/users`}
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
}
