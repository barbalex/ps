import { useMemo, memo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const FileNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    action_id,
    file,
    level = 2,
  }) => {
    const location = useLocation()

    const isPreview = location.pathname.endsWith('/preview')
    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    const ownArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
        ...(action_id ? ['actions', action_id] : []),
        ...(check_id ? ['checks', check_id] : []),
        'files',
        file.file_id,
        ...(isPreview ? ['preview'] : []),
      ],
      [
        action_id,
        check_id,
        file.file_id,
        isPreview,
        place_id,
        place_id2,
        project_id,
        subproject_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={file}
        id={file.file_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
