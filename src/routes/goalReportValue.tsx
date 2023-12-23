import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { goalReportValue as createGoalReportValuePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    goal_id,
    goal_report_id,
    goal_report_value_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_report_values.liveUnique({ where: { goal_report_value_id } }),
    [goal_report_value_id],
  )

  const addRow = useCallback(async () => {
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
  }, [
    db.goal_report_values,
    goal_id,
    goal_report_id,
    navigate,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.goal_report_values.delete({
      where: {
        goal_report_value_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`,
    )
  }, [
    db.goal_report_values,
    goal_id,
    goal_report_id,
    goal_report_value_id,
    navigate,
    project_id,
    subproject_id,
  ])

  const row: GoalReportValue = results

  // console.log('GoalReportValue', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.goal_report_values.update({
        where: { goal_report_value_id },
        data: { [name]: value },
      })
    },
    [db.goal_report_values, goal_report_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="goal report value"
      />
      <TextFieldInactive
        label="ID"
        name="goal_report_value_id"
        value={row.goal_report_value_id ?? ''}
      />
      <TextField
        label="Unit ID"
        name="unit_id"
        value={row.unit_id ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value (integer)"
        name="value_integer"
        type="number"
        value={row.value_integer ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value (numeric)"
        name="value_numeric"
        type="number"
        value={row.value_numeric ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value (text)"
        name="value_text"
        value={row.value_text ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
