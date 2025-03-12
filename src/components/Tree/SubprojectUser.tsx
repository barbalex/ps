import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const SubprojectUserNode = memo(
  ({ project_id, subproject_id, subprojectUser, level = 6 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'users',
        subprojectUser.subproject_user_id,
      ],
      [project_id, subprojectUser.subproject_user_id, subproject_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={subprojectUser}
        id={subprojectUser.subproject_user_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
