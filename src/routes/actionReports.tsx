import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { actionReport as createActionReport } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_reports.liveMany({ where: { action_id, deleted: false } }),
    [action_id],
  )

  const add = useCallback(async () => {
    const data = await createActionReport({
      db,
      project_id,
      action_id,
    })
    await db.action_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${data.action_report_id}`,
    )
  }, [action_id, db, navigate, place_id, place_id2, project_id, subproject_id])

  const actionReports: ActionReport[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="action report" />
      {actionReports.map((actionReport: ActionReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action_id}/reports/${actionReport.action_report_id}`}
          >
            {actionReport.label ?? actionReport.action_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
