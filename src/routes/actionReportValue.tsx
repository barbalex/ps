import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { createActionReportValue } from '../modules/createRows'
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
    place_id,
    place_id2,
    action_id,
    action_report_id,
    action_report_value_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.action_report_values.liveUnique({ where: { action_report_value_id } }),
    [action_report_value_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${action_report_id}/values`,
    [
      action_id,
      action_report_id,
      place_id,
      place_id2,
      project_id,
      subproject_id,
    ],
  )

  const addRow = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate(`${baseUrl}/${actionReportValue.action_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [action_report_id, baseUrl, db.action_report_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.action_report_values.delete({
      where: {
        action_report_value_id,
      },
    })
    navigate(baseUrl)
  }, [action_report_value_id, baseUrl, db.action_report_values, navigate])

  const toNext = useCallback(async () => {
    const actionReportValues = await db.action_report_values.findMany({
      where: { deleted: false, action_report_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const next = actionReportValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    baseUrl,
    db.action_report_values,
    navigate,
  ])

  const toPrevious = useCallback(async () => {
    const actionReportValues = await db.action_report_values.findMany({
      where: { deleted: false, action_report_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const previous = actionReportValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    baseUrl,
    db.action_report_values,
    navigate,
  ])

  const row: ActionReportValue = results

  const unitWhere = useMemo(() => ({ use_for_action_report_values: true }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_report_values.update({
        where: { action_report_value_id },
        data: { [name]: value },
      })
    },
    [db.action_report_values, action_report_value_id],
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
        name="action_report_value_id"
        value={row.action_report_value_id ?? ''}
      />
      <DropdownField
        label="Unit"
        name="unit_id"
        table="units"
        where={unitWhere}
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
