import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Places as PlaceUser } from '../../../generated/client'

export const PlaceUserNode = ({
  project_id,
  subproject_id,
  place_id,
  placeUser,
  level = 8,
}: {
  project_id: string
  subproject_id: string
  placeUser: PlaceUser
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places' &&
    urlPath[5] === place_id &&
    urlPath[6] === 'users' &&
    urlPath[7] === placeUser.place_user_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users/${placeUser.place_user_id}`,
    )
  }, [
    isOpen,
    navigate,
    placeUser.place_user_id,
    place_id,
    project_id,
    subproject_id,
  ])

  return (
    <Node
      node={placeUser}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={10}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users/${placeUser.place_user_id}`}
      onClickButton={onClickButton}
    />
  )
}
