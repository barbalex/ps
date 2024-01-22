import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { PlaceLevels as PlaceLevel } from '../../../generated/client'

export const PlaceLevelNode = ({
  project_id,
  placeLevel,
  level = 4,
}: {
  project_id: string
  placeLevel: PlaceLevel
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'place-levels' &&
    urlPath[3] === placeLevel.place_level_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/place-levels`)
    navigate(
      `/projects/${project_id}/place-levels/${placeLevel.place_level_id}`,
    )
  }, [isOpen, navigate, project_id, placeLevel.place_level_id])

  return (
    <Node
      node={placeLevel}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/place-levels/${placeLevel.place_level_id}`}
      onClickButton={onClickButton}
    />
  )
}
