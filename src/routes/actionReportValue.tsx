import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { actionReportValue as createActionReportValue } from '../modules/createRows'
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

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.action_report_values.liveUnique({ where: { action_report_value_id } }),
    [action_report_value_id],
  )

  const addRow = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${action_report_id}/values/${
        actionReportValue.action_report_value_id
      }`,
    )
  }, [
    action_id,
    action_report_id,
    db.action_report_values,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.action_report_values.delete({
      where: {
        action_report_value_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${action_report_id}/values`,
    )
  }, [
    action_id,
    action_report_id,
    action_report_value_id,
    db.action_report_values,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
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
