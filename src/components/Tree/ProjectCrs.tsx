import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const ProjectCrsNode = memo(({ projectId, projectCrs, level = 4 }) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => ['data', 'projects', projectId, 'crs', projectCrs.project_crs_id],
    [projectId, projectCrs.project_crs_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      node={projectCrs}
      id={projectCrs.project_crs_id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
})
