import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { SubprojectReports as SubprojectReport } from '../../../generated/client'

export const SubprojectReportNode = ({
  project_id,
  subproject_id,
  subprojectReport,
  level = 6,
}: {
  project_id: string
  subproject_id: string
  subprojectReport: SubprojectReport
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
    urlPath[4] === 'reports' &&
    urlPath[5] === subprojectReport.subproject_report_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/reports`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${subprojectReport.subproject_report_id}`,
    )
  }, [isOpen, navigate, subprojectReport.subproject_report_id, project_id, subproject_id])

  return (
    <Node
      node={subprojectReport}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={10}
      to={`/projects/${project_id}/subprojects/${subproject_id}/reports/${subprojectReport.subproject_report_id}`}
      onClickButton={onClickButton}
    />
  )
}
