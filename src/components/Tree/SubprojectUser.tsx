import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { SubprojectUsers as SubprojectUser } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  subprojectUser: SubprojectUser
  level?: number
}

export const SubprojectUserNode = memo(
  ({ project_id, subproject_id, subprojectUser, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'users' &&
      urlPath[6] === subprojectUser.subproject_user_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = [
      'data',
      'projects',
      project_id,
      'subprojects',
      subproject_id,
      'users',
    ]
    const baseUrl = `/data/projects/${project_id}/subprojects/${subproject_id}/users`

    return (
      <Node
        node={subprojectUser}
        id={subprojectUser.subproject_user_id}
        level={level}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${subprojectUser.subproject_user_id}`}
      />
    )
  },
)
