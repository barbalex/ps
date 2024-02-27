import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import {
  PlaceUsers as PlaceUser,
  Places as Place,
} from '../../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  placeUser: PlaceUser
  place: Place
  level?: number
}

export const PlaceUserNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    placeUser,
    place,
    level = 8,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id &&
        urlPath[8] === 'users' &&
        urlPath[9] === placeUser.place_user_id
      : isOpenBase &&
        urlPath[6] === 'users' &&
        urlPath[7] === placeUser.place_user_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/users`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${placeUser.place_user_id}`)
    }, [baseUrl, isOpen, navigate, placeUser.place_user_id])

    return (
      <Node
        node={placeUser}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`${baseUrl}/${placeUser.place_user_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
