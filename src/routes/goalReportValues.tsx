import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, goal_id, goal_report_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.goal_report_values.liveMany())

  const add = async () => {
    await db.goal_report_values.create({
      data: {
        goal_report_value_id: uuidv7(),
        goal_report_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const goalReportValues: GoalReportValue[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {goalReportValues.map(
        (goalReportValue: GoalReportValue, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values/${goalReportValue.goal_report_value_id}`}
            >
              {goalReportValue.goal_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
