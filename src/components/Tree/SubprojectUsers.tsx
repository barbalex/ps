import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { SubprojectUsers as SubprojectUser } from '../../../generated/client'
import { SubprojectUserNode } from './SubprojectUser'

export const SubprojectUsersNode = ({
  project_id,
  subproject_id,
  level = 5,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.subproject_users.liveMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const subprojectUsers: SubprojectUser[] = results ?? []

  const subprojectUsersNode = useMemo(
    () => ({
      label: `Users (${subprojectUsers.length})`,
    }),
    [subprojectUsers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'users'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/subprojects/${subproject_id}`)
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/users`)
  }, [isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={subprojectUsersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={subprojectUsers.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/users`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojectUsers.map((subprojectUser) => (
          <SubprojectUserNode
            key={subprojectUser.subproject_user_id}
            project_id={project_id}
            subproject_id={subproject_id}
            subprojectUser={subprojectUser}
          />
        ))}
    </>
  )
}
