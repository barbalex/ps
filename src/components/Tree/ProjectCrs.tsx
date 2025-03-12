import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const ProjectCrsNode = memo(({ project_id, projectCrs, level = 4 }) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => [
      'data',
      'projects',
      project_id,
      'project-crs',
      projectCrs.project_crs_id,
    ],
    [project_id, projectCrs.project_crs_id],
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
