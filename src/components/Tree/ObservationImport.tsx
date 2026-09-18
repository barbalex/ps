import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

type NavData = {
  id: string
  label: string
}

interface Props {
  projectId: string
  subprojectId: string
  nav: NavData
  level?: number
}

export const ObservationImportNode = ({
  projectId,
  subprojectId,
  nav,
  level = 6,
}: Props) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'observation-imports',
    nav.id,
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
