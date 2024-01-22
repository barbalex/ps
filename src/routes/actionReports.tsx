import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createActionReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.action_reports.liveMany({
        where: { action_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
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
    <div className="list-view">
      <ListViewHeader
        title="Action Reports"
        addRow={add}
        tableName="action report"
      />
      <div className="list-container">
        {actionReports.map(({ action_report_id, label }) => (
          <Row
            key={action_report_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action_id}/reports/${action_report_id}`}
          />
        ))}
      </div>
    </div>
  )
}
