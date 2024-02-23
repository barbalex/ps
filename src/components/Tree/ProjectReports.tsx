import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ProjectReportNode } from './ProjectReport'

type Props = {
  project_id: string
  level?: number
}

export const ProjectReportsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: projectReports = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const projectReportsNode = useMemo(
    () => ({ label: `Reports (${projectReports.length})` }),
    [projectReports.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'reports'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/reports`)
  }, [baseUrl, isOpen, navigate])

  return (
    <>
      <Node
        node={projectReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projectReports.length}
        to={`${baseUrl}/reports`}
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
})
