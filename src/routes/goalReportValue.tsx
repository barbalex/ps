import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { createGoalReportValue } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
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

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_report_values.liveUnique({ where: { goal_report_value_id } }),
    [goal_report_value_id],
  )

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`

  const addRow = useCallback(async () => {
    const goalReportValue = createGoalReportValue()
    await db.goal_report_values.create({
      data: {
        ...goalReportValue,
        goal_report_id,
      },
    })
    navigate(`${baseUrl}/${goalReportValue.goal_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.goal_report_values, goal_report_id, navigate])

  const deleteRow = useCallback(async () => {
    await db.goal_report_values.delete({
      where: {
        goal_report_value_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.goal_report_values, goal_report_value_id, navigate])

  const toNext = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { deleted: false, goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const next = goalReportValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.goal_report_value_id}`)
  }, [
    baseUrl,
    db.goal_report_values,
    goal_report_id,
    goal_report_value_id,
    navigate,
  ])

  const toPrevious = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { deleted: false, goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const previous = goalReportValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.goal_report_value_id}`)
  }, [
    baseUrl,
    db.goal_report_values,
    goal_report_id,
    goal_report_value_id,
    navigate,
  ])

  const row: GoalReportValue = results

  const unitWhere = useMemo(() => ({ use_for_goal_report_values: true }), [])
  const unitOrderBy = useMemo(() => [{ sort: 'asc' }, { name: 'asc' }], [])

  // console.log('GoalReportValue', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.goal_report_values.update({
        where: { goal_report_value_id },
        data: { 
          [name]:
            isNaN(value) && ['value_integer', 'value_numeric'].includes(name)
              ? null
              : value, },
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
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="goal report value"
      />
      <TextFieldInactive
        label="ID"
        name="goal_report_value_id"
        value={row.goal_report_value_id ?? ''}
      />
      <DropdownField
        label="Unit"
        name="unit_id"
        table="units"
        where={unitWhere}
        orderBy={unitOrderBy}
        value={row.unit_id ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
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
