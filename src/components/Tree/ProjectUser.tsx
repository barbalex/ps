import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ProjectUsers as ProjectUser } from '../../../generated/client'

type Props = {
  project_id: string
  projectUser: ProjectUser
  level?: number
}

export const ProjectUserNode = memo(
  ({ project_id, projectUser, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'users' &&
      urlPath[3] === projectUser.project_user_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/users`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${projectUser.project_user_id}`)
    }, [isOpen, navigate, baseUrl, projectUser.project_user_id])

    return (
      <Node
        node={projectUser}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${projectUser.project_user_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
