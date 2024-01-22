import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { SubprojectReports as SubprojectReport } from '../../../generated/client'
import { SubprojectReportNode } from './SubprojectReport'

export const SubprojectReportsNode = ({
  project_id,
  subproject_id,
  level = 5,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.subproject_reports.liveMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const subprojectReports: SubprojectReport[] = results ?? []

  const subprojectReportsNode = useMemo(
    () => ({
      label: `Reports (${subprojectReports.length})`,
    }),
    [subprojectReports.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'reports'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/subprojects/${subproject_id}`)
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/reports`)
  }, [isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={subprojectReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={subprojectReports.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/reports`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojectReports.map((subprojectReport) => (
          <SubprojectReportNode
            key={subprojectReport.subproject_report_id}
            project_id={project_id}
            subproject_id={subproject_id}
            subprojectReport={subprojectReport}
            level={level + 1}
          />
        ))}
    </>
  )
}
