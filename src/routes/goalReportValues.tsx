import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { goalReportValue as createGoalReportValuePreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.goal_report_values.liveMany({
        where: { goal_report_id, deleted: false },
      }),
    [goal_report_id],
  )

  const add = async () => {
    const newGoalReportValue = createGoalReportValuePreset()
    await db.goal_report_values.create({
      data: {
        ...newGoalReportValue,
        goal_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values/${newGoalReportValue.goal_report_value_id}`,
    )
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
              {goalReportValue.label ?? goalReportValue.goal_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
