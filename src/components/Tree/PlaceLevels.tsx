import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { PlaceLevelNode } from './PlaceLevel'

export const PlaceLevelsNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.place_levels.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const placeLevels: PlaceLevel[] = results ?? []

  const placeLevelsNode = useMemo(
    () => ({
      label: `Place Levels (${placeLevels.length})`,
    }),
    [placeLevels.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'place-levels'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/place-levels`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={placeLevelsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={placeLevels.length}
        to={`/projects/${project_id}/place-levels`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        placeLevels.map((placeLevel) => (
          <PlaceLevelNode
            key={placeLevel.place_level_id}
            project_id={project_id}
            placeLevel={placeLevel}
          />
        ))}
    </>
  )
}
