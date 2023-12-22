// import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { GoalReports as GoalReport } from '../../../generated/client'
import { goalReport as createGoalReportPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
// import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_reports.liveUnique({ where: { goal_report_id } }),
    [goal_report_id],
  )

  const addRow = async () => {
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
  }

  const deleteRow = async () => {
    await db.goal_reports.delete({
      where: {
        goal_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
    )
  }

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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new goal report"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete goal report"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="goal_report_id"
        value={row.goal_report_id ?? ''}
      />
    </div>
  )
}
