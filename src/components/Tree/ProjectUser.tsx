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
  ({ project_id, projectUser, level = 4 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'users',
        projectUser.project_user_id,
      ],
      [projectUser.project_user_id, project_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={projectUser}
        id={projectUser.project_user_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
