import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { goalReport as createGoalReportPreset } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
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
    const newGoalReport = createGoalReportPreset()
    await db.goal_reports.create({
      data: {
        ...newGoalReport,
        goal_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${newGoalReport.goal_report_id}`,
    )
  }, [db.goal_reports, goal_id, navigate, project_id, subproject_id])

  const goals: GoalReport[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="goal report" />
      {goals.map((goalReport: GoalReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goalReport.goal_report_id}`}
          >
            {goalReport.label ?? goalReport.goal_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
