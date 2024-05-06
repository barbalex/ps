import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node.tsx'
import { ProjectUsers as ProjectUser } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  projectUser: ProjectUser
  level?: number
}

export const ProjectUserNode = memo(
  ({ project_id, projectUser, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'users' &&
      urlPath[3] === projectUser.project_user_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/users`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${projectUser.project_user_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, projectUser.project_user_id, searchParams])

    return (
      <Node
        node={projectUser}
        id={projectUser.project_user_id}
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
