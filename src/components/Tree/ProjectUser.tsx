import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ProjectUsers as ProjectUser } from '../../../generated/client'

export const ProjectUserNode = ({
  project_id,
  projectUser,
  level = 4,
}: {
  project_id: string
  projectUser: ProjectUser
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'users' &&
    urlPath[3] === projectUser.project_user_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/users`)
    navigate(`/projects/${project_id}/users/${projectUser.project_user_id}`)
  }, [isOpen, navigate, project_id, projectUser.project_user_id])

  return (
    <Node
      node={projectUser}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/users/${projectUser.project_user_id}`}
      onClickButton={onClickButton}
    />
  )
}
