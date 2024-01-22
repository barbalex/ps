import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'

export const PlaceReportValueNode = ({
  project_id,
  subproject_id,
  place_id,
  place_report_id,
  placeReportValue,
  level = 10,
}: {
  project_id: string
  subproject_id: string
  placeReportValue: PlaceReportValue
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
    urlPath[6] === 'reports' &&
    urlPath[7] === place_report_id &&
    urlPath[8] === 'values' &&
    urlPath[9] === placeReportValue.place_report_value_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values/${placeReportValue.place_report_value_id}`,
    )
  }, [
    isOpen,
    navigate,
    placeReportValue.place_report_value_id,
    place_id,
    place_report_id,
    project_id,
    subproject_id,
  ])

  return (
    <Node
      node={placeReportValue}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={10}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values/${placeReportValue.place_report_value_id}`}
      onClickButton={onClickButton}
    />
  )
}
