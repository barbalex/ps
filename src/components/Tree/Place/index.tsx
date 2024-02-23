import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from '../Node'
import { Places as Place } from '../../../generated/client'
import { PlaceChildren } from './Children'

export const PlaceNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
  }: {
    project_id: string
    subproject_id: string
    place_id?: string
    place: Place
  }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const level = place_id ? 8 : 6

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places'
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id
      : isOpenBase && urlPath[5] === place.place_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places${
      place_id ? `/${place_id}/places` : ''
    }`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${place.place_id}`)
    }, [baseUrl, isOpen, navigate, place.place_id])

    return (
      <>
        <Node
          node={place}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${place.place_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <PlaceChildren
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level}
          />
        )}
      </>
    )
  },
)
