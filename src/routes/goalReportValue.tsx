import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { goalReportValue as createGoalReportValuePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { goal_report_id, goal_report_value_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_report_values.liveUnique({ where: { goal_report_value_id } }),
    [goal_report_value_id],
  )

  const addRow = async () => {
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

  const deleteRow = async () => {
    await db.goal_report_values.delete({
      where: {
        goal_report_value_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`,
    )
  }

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
