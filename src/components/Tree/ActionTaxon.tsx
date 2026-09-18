import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'

type NavData = {
  id: string
  label: string
}

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  actionId: string
  nav: NavData
  level?: number
}

export const ActionTaxonNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  nav,
  level = 10,
}: Props) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'actions',
    actionId,
    'taxa',
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
