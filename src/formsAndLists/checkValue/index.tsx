import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const CheckValue = ({ from }) => {
  const { checkValueId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM check_values WHERE check_value_id = $1`,
    [checkValueId],
  )
  const row = res?.rows?.[0]

  // console.log('CheckValue', { row, results })

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE check_values SET ${name} = $1 WHERE check_value_id = $2`, [
      value,
      checkValueId,
    ])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Check Value"
        id={checkValueId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div className="form-container">
        <DropdownField
          label="Unit"
          name="unit_id"
          table="units"
          where="use_for_check_values is true"
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
