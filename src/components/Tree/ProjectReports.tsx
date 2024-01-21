import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ProjectReports as ProjectReport } from '../../../generated/client'
import { ProjectReportNode } from './ProjectReport'

export const ProjectReportsNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.project_reports.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const projectReports: ProjectReport[] = results ?? []

  const projectReportsNode = useMemo(
    () => ({
      label: `Reports (${projectReports.length})`,
    }),
    [projectReports.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'reports'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/reports`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={projectReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projectReports.length}
        to={`/projects/${project_id}/reports`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projectReports.map((projectReport) => (
          <ProjectReportNode
            key={projectReport.project_report_id}
            project_id={project_id}
            projectReport={projectReport}
          />
        ))}
    </>
  )
}
