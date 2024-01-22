import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { PlaceReports as PlaceReport } from '../../../generated/client'

export const PlaceReportNode = ({
  project_id,
  subproject_id,
  place_id,
  placeReport,
  level = 8,
}: {
  project_id: string
  subproject_id: string
  placeReport: PlaceReport
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
    urlPath[7] === placeReport.place_report_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${placeReport.place_report_id}`,
    )
  }, [
    isOpen,
    navigate,
    placeReport.place_report_id,
    place_id,
    project_id,
    subproject_id,
  ])

  return (
    <Node
      node={placeReport}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={10}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${placeReport.place_report_id}`}
      onClickButton={onClickButton}
    />
  )
}
