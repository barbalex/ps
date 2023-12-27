import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { actionReport as createActionReportPreset } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, action_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_reports.liveMany({ where: { action_id, deleted: false } }),
    [action_id],
  )

  const add = useCallback(async () => {
    const newActionReport = createActionReportPreset()
    await db.action_reports.create({
      data: {
        ...newActionReport,
        action_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${newActionReport.action_report_id}`,
    )
  }, [
    action_id,
    db.action_reports,
    navigate,
    place_id,
    project_id,
    subproject_id,
  ])

  const actionReports: ActionReport[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="action report" />
      {actionReports.map((actionReport: ActionReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${actionReport.action_report_id}`}
          >
            {actionReport.label ?? actionReport.action_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
