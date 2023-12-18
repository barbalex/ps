import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id, action_id, action_report_id } =
    useParams<{
      subproject_id: string
      project_id: string
      place_id: string
      action_id: string
      action_report_id: string
    }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.action_report_values.liveMany())

  const add = async () => {
    await db.action_report_values.create({
      data: {
        action_report_value_id: uuidv7(),
        action_report_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.action_report_values.deleteMany()
  }

  const actionReportValues: ActionReportValue[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {actionReportValues.map(
        (actionReportValue: ActionReportValue, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/reports/${actionReportValue.action_report_value_id}/values/${actionReportValue.action_report_value_id}`}
            >
              {actionReportValue.action_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
