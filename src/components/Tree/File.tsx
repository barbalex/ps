import { useMemo, memo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const FileNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
    actionId,
    file,
    level = 2,
  }) => {
    const location = useLocation()

    const isPreview = location.pathname.endsWith('/preview')
    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    const ownArray = useMemo(
      () => [
        'data',
        ...(projectId ? ['projects', projectId] : []),
        ...(subprojectId ? ['subprojects', subprojectId] : []),
        ...(placeId ? ['places', placeId] : []),
        ...(placeId2 ? ['places', placeId2] : []),
        ...(actionId ? ['actions', actionId] : []),
        ...(checkId ? ['checks', checkId] : []),
        'files',
        file.file_id,
        ...(isPreview ? ['preview'] : []),
      ],
      [
        actionId,
        checkId,
        file.file_id,
        isPreview,
        placeId,
        placeId2,
        projectId,
        subprojectId,
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
