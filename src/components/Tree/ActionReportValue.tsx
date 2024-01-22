import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'

export const ActionReportValueNode = ({
  project_id,
  subproject_id,
  place_id,
  action_id,
  action_report_id,
  actionReportValue,
  level = 12,
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
    urlPath[8] === 'reports' &&
    urlPath[9] === action_report_id &&
    urlPath[10] === 'values' &&
    urlPath[11] === actionReportValue.action_report_value_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${action_report_id}/values`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${action_report_id}/values/${actionReportValue.action_report_value_id}`,
    )
  }, [
    isOpen,
    navigate,
    project_id,
    subproject_id,
    place_id,
    action_id,
    action_report_id,
    actionReportValue.action_report_value_id,
  ])

  return (
    <Node
      node={actionReportValue}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${action_report_id}/values/${actionReportValue.action_report_value_id}`}
      onClickButton={onClickButton}
    />
  )
}
