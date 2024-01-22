import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'

export const ActionValueNode = ({
  project_id,
  subproject_id,
  place_id,
  action_id,
  actionValue,
  level = 10,
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
    urlPath[6] === 'actions' &&
    urlPath[7] === action_id &&
    urlPath[8] === 'values' &&
    urlPath[9] === actionValue.action_value_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/values`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/values/${actionValue.action_value_id}`,
    )
  }, [
    isOpen,
    navigate,
    project_id,
    subproject_id,
    place_id,
    action_id,
    actionValue.action_value_id,
  ])

  return (
    <Node
      node={actionValue}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/values/${actionValue.action_value_id}`}
      onClickButton={onClickButton}
    />
  )
}
