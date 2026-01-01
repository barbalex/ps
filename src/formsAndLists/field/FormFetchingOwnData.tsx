import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { FieldForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Field from '../../models/public/Field.ts'

// separate from the route because it is also used inside other forms
export const FieldFormFetchingOwnData = ({
  fieldId,
  autoFocusRef,
  isInForm = false,
  from,
}) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const res = useLiveQuery(`SELECT * FROM fields WHERE field_id = $1`, [
    fieldId,
  ])
  const row: Field | undefined = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE fields SET ${name} = $1 WHERE field_id = $2`, [
      value,
      fieldId,
    ])
    addOperation({
      table: 'fields',
      rowIdName: 'field_id',
      rowId: fieldId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Field" id={fieldId} />
  }

  return (
    <div className="form-container">
      <Form
        onChange={onChange}
        row={row}
        autoFocusRef={autoFocusRef}
        isInForm={isInForm}
        from={from}
      />
    </div>
  )
}
