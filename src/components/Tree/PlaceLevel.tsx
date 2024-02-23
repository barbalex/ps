import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { PlaceLevels as PlaceLevel } from '../../../generated/client'

type Props = {
  project_id: string
  placeLevel: PlaceLevel
  level?: number
}

export const PlaceLevelNode = memo(
  ({ project_id, placeLevel, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'place-levels' &&
      urlPath[3] === placeLevel.place_level_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/place-levels`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${placeLevel.place_level_id}`)
    }, [isOpen, navigate, baseUrl, placeLevel.place_level_id])

    return (
      <Node
        node={placeLevel}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${placeLevel.place_level_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
