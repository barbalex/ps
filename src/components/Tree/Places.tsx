import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Places as Place } from '../../../generated/client'
import { PlaceNode } from './Place'

export const PlacesNode = ({ project_id, subproject_id, place_id }) => {
  const level = place_id ? 7 : 5
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.places.liveMany({
      where: { deleted: false, parent_id: place_id ?? null, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const places: Place[] = results ?? []

  const { results: placeLevels } = useLiveQuery(
    db.place_levels.liveMany({
      where: {
        deleted: false,
        project_id,
        level: place_id ? 2 : 1,
      },
      orderBy: { label: 'asc' },
    }),
  )
  const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

  // get name by place_level
  const placesNode = useMemo(
    () => ({
      label: `${placeNamePlural} (${places.length})`,
    }),
    [placeNamePlural, places.length],
  )

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places${
    place_id ? `/${place_id}/places` : ''
  }`

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpenBase =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places'
  const isOpen = place_id
    ? isOpenBase && urlPath[5] === place_id && urlPath[6] === 'places'
    : isOpenBase
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/subprojects/${subproject_id}`)
    navigate(baseUrl)
  }, [baseUrl, isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={placesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={places.length}
        to={baseUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        places.map((place) => (
          <PlaceNode
            key={place.place_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level + 1}
          />
        ))}
    </>
  )
}
