import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createGoalReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, goal_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_reports.liveMany({ where: { goal_id, deleted: false } }),
    [goal_id],
  )

  const add = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${data.goal_report_id}`,
    )
  }, [db, goal_id, navigate, project_id, subproject_id])

  const goals: GoalReport[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Goal Reports"
        addRow={add}
        tableName="goal report"
      />
      <div className="list-container">
        {goals.map(({ goal_report_id, label }) => (
          <Row
            key={goal_report_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}`}
          />
        ))}
      </div>
    </div>
  )
}
