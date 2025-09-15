import { useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

// not using memo because: "Component is not a function"
export const ChartSubjectNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  chartId,
  nav,
  level = 2,
}) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => [
      'data',
      ...(projectId ? ['projects', projectId] : []),
      ...(subprojectId ? ['subprojects', subprojectId] : []),
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
      'charts',
      chartId,
      'subjects',
      nav.id,
    ],
    [nav.id, chartId, placeId, placeId2, projectId, subprojectId],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      label={nav.label}
      id={nav.id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
}
