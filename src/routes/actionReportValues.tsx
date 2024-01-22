import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createActionReportValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_report_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.action_report_values.liveMany({
        where: { action_report_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [action_report_id],
  )

  const add = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${action_report_id}/values/${
        actionReportValue.action_report_value_id
      }`,
    )
  }, [
    action_id,
    action_report_id,
    db.action_report_values,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const actionReportValues: ActionReportValue[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Report Values"
        addRow={add}
        tableName="action report value"
      />
      <div className="list-container">
        {actionReportValues.map(({ action_report_value_id, label }) => (
          <Row
            key={action_report_value_id}
            label={label}
            navigateTo={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action_id}/reports/${action_report_id}/values/${action_report_value_id}`}
          />
        ))}
      </div>
    </div>
  )
}
