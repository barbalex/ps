import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { actionReportValue as createActionReportValue } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="action report value" />
      {actionReportValues.map(
        (actionReportValue: ActionReportValue, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
                place_id2 ? `/places/${place_id2}` : ''
              }/actions/${action_id}/reports/${action_report_id}/values/${
                actionReportValue.action_report_value_id
              }`}
            >
              {actionReportValue.label ??
                actionReportValue.action_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
