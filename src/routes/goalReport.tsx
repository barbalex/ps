import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'
import { createGoalReport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { FormMenu } from '../components/FormMenu'
// import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_reports.liveUnique({ where: { goal_report_id } }),
    [goal_report_id],
  )

  const addRow = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${data.goal_report_id}`,
    )
  }, [db, goal_id, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.goal_reports.delete({
      where: {
        goal_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
    )
  }, [
    db.goal_reports,
    goal_id,
    goal_report_id,
    navigate,
    project_id,
    subproject_id,
  ])

  const row: GoalReport = results

  // console.log('goalReport', { row, goal_id })

  // const onChange = useCallback(
  //   (e, data) => {
  //     const { name, value } = getValueFromChange(e, data)
  //     db.goal_reports.update({
  //       where: { goal_report_id },
  //       data: { [name]: value },
  //     })
  //   },
  //   [db.goal_reports],
  // )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="goal report" />
      <TextFieldInactive
        label="ID"
        name="goal_report_id"
        value={row.goal_report_id ?? ''}
      />
      <Jsonb
        table="goal_reports"
        idField="goal_report_id"
        id={row.goal_report_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
