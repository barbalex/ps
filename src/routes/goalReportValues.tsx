import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createGoalReportValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
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

  const add = useCallback(async () => {
    const newGoalReportValue = createGoalReportValue()
    await db.goal_report_values.create({
      data: {
        ...newGoalReportValue,
        goal_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values/${newGoalReportValue.goal_report_value_id}`,
    )
  }, [
    db.goal_report_values,
    goal_id,
    goal_report_id,
    navigate,
    project_id,
    subproject_id,
  ])

  const goalReportValues: GoalReportValue[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Goal Report Values"
        addRow={add}
        tableName="goal report value"
      />
      <div className="list-container">
        {goalReportValues.map(({ goal_report_value_id, label }) => (
          <Row
            key={goal_report_value_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values/${goal_report_value_id}`}
          />
        ))}
      </div>
    </div>
  )
}
