import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

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

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'users' &&
      urlPath[4] === projectUser.project_user_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => ['data', 'projects', project_id, 'users'],
      [project_id],
    )
    const baseUrl = baseArray.join('/')

    return (
      <Node
        node={projectUser}
        id={projectUser.project_user_id}
        level={level}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${projectUser.project_user_id}`}
      />
    )
  },
)
