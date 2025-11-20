import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

export const FileNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkId,
  actionId,
  nav,
  level = 2,
}) => {
  const location = useLocation()

  const isPreview = location.pathname.endsWith('/preview')
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  const ownArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    ...(actionId ? ['actions', actionId] : []),
    ...(checkId ? ['checks', checkId] : []),
    'files',
    nav.id,
    ...(isPreview ? ['preview'] : []),
  ]
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
