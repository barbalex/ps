import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { PlaceUsers as PlaceUser } from '../../../generated/client'
import { PlaceUserNode } from './PlaceUser'

export const PlaceUsersNode = ({
  project_id,
  subproject_id,
  place_id,
  level = 7,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.place_users.liveMany({
      where: { deleted: false, place_id },
      orderBy: { label: 'asc' },
    }),
  )
  const placeUsers: PlaceUser[] = results ?? []

  // TODO: get name by place_level
  const placeUsersNode = useMemo(
    () => ({
      label: `Users (${placeUsers.length})`,
    }),
    [placeUsers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places' &&
    urlPath[5] === place_id &&
    urlPath[6] === 'users'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users`,
    )
  }, [isOpen, navigate, place_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={placeUsersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={placeUsers.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/users`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        placeUsers.map((placeUser) => (
          <PlaceUserNode
            key={placeUser.place_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            placeUser={placeUser}
          />
        ))}
    </>
  )
}
