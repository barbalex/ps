import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ProjectReports as ProjectReport } from '../../../generated/client'

export const ProjectReportNode = ({
  project_id,
  projectReport,
  level = 4,
}: {
  projectReports: ProjectReport[]
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'reports' &&
    urlPath[3] === projectReport.project_report_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/reports`)
    navigate(
      `/projects/${project_id}/reports/${projectReport.project_report_id}`,
    )
  }, [isOpen, navigate, project_id, projectReport.project_report_id])

  return (
    <Node
      node={projectReport}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/reports/${projectReport.project_report_id}`}
      onClickButton={onClickButton}
    />
  )
}
