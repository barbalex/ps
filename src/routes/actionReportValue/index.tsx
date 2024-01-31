import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DropdownField } from '../../components/shared/DropdownField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeaderComponent } from './FormHeader'

import '../../form.css'

export const Component = () => {
  const { action_report_value_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.action_report_values.liveUnique({ where: { action_report_value_id } }),
  )

  const row: ActionReportValue = results

  const unitWhere = useMemo(() => ({ use_for_action_report_values: true }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_report_values.update({
        where: { action_report_value_id },
        data: {
          [name]:
            isNaN(value) && ['value_integer', 'value_numeric'].includes(name)
              ? null
              : value,
        },
      })
    },
    [db.action_report_values, action_report_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeaderComponent autoFocusRef={autoFocusRef} />
      <div className="form-container">
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
    </div>
  )
}
