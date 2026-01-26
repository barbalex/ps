import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type PlaceReportValues from '../../models/public/PlaceReportValues.ts'

import '../../form.css'

export const PlaceReportValue = ({ from }) => {
  const { placeReportValueId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_report_values WHERE place_report_value_id = $1`,
    [placeReportValueId],
  )
  const row: PlaceReportValues | undefined = res?.rows?.[0]

  // console.log('PlaceReportValue, row:', row)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE place_report_values SET ${name} = $1 WHERE place_report_value_id = $2`,
        [value, placeReportValueId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'place_report_values',
      rowIdName: 'place_report_value_id',
      rowId: placeReportValueId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Report Value" id={placeReportValueId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <DropdownField
          label="Unit"
          name="unit_id"
          table="units"
          where="use_for_place_report_values is true"
          value={row.unit_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.unit_id?.state}
          validationMessage={validations?.unit_id?.message}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
          validationState={validations?.value_integer?.state}
          validationMessage={validations?.value_integer?.message}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
          validationState={validations?.value_numeric?.state}
          validationMessage={validations?.value_numeric?.message}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
          validationState={validations?.value_text?.state}
          validationMessage={validations?.value_text?.message}
        />
      </div>
    </div>
  )
}
