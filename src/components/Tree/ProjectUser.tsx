import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

export const ProjectUserNode = ({ projectId, nav, level = 4 }) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = ['data', 'projects', projectId, 'users', nav.id]
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
