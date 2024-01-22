import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ActionReports as ActionReport } from '../../../generated/client'
import { ActionReportNode } from './ActionReport'

export const ActionReportsNode = ({
  project_id,
  subproject_id,
  place_id,
  action_id,
  level = 9,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.action_reports.liveMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    }),
  )
  const actionReports: ActionReport[] = results ?? []

  const actionReportsNode = useMemo(
    () => ({
      label: `Reports (${actionReports.length})`,
    }),
    [actionReports.length],
  )

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
    urlPath[8] === 'reports'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports`,
    )
  }, [action_id, isOpen, navigate, place_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={actionReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={actionReports.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        actionReports.map((actionReport) => (
          <ActionReportNode
            key={actionReport.action_report_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            action_id={action_id}
            actionReport={actionReport}
          />
        ))}
    </>
  )
}
