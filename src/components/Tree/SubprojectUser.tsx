import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { SubprojectUsers as SubprojectUser } from '../../../generated/client'

export const SubprojectUserNode = ({
  project_id,
  subproject_id,
  subprojectUser,
  level = 6,
}: {
  project_id: string
  subproject_id: string
  subprojectUser: SubprojectUser
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
    urlPath[4] === 'users' &&
    urlPath[5] === subprojectUser.subproject_user_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/users`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/users/${subprojectUser.subproject_user_id}`,
    )
  }, [isOpen, navigate, subprojectUser.subproject_user_id, project_id, subproject_id])

  return (
    <Node
      node={subprojectUser}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={10}
      to={`/projects/${project_id}/subprojects/${subproject_id}/users/${subprojectUser.subproject_user_id}`}
      onClickButton={onClickButton}
    />
  )
}
