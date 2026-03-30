import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

export const CheckReportQuantityNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkReportId,
  nav,
  level = 10,
}) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'check-reports',
    checkReportId,
    'quantities',
  ]
  const ownArray = [...parentArray, nav.id]
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
