import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'

export const ActionReportValueNode = ({
  project_id,
  subproject_id,
  place_id,
  place,
  action_id,
  action_report_id,
  actionReportValue,
  level = 12,
}) => {
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
      urlPath[8] === 'actions' &&
      urlPath[9] === action_id &&
      urlPath[10] === 'reports' &&
      urlPath[11] === action_report_id &&
      urlPath[12] === 'values' &&
      urlPath[13] === actionReportValue.action_report_value_id
    : isOpenBase &&
      urlPath[6] === 'actions' &&
      urlPath[7] === action_id &&
      urlPath[8] === 'reports' &&
      urlPath[9] === action_report_id &&
      urlPath[10] === 'values' &&
      urlPath[11] === actionReportValue.action_report_value_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
    place_id ?? place.place_id
  }${
    place_id ? `/places/${place.place_id}` : ''
  }/actions/${action_id}/reports/${action_report_id}/values`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${actionReportValue.action_report_value_id}`)
  }, [isOpen, navigate, baseUrl, actionReportValue.action_report_value_id])

  return (
    <Node
      node={actionReportValue}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${actionReportValue.action_report_value_id}`}
      onClickButton={onClickButton}
    />
  )
}
