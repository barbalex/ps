import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ListValues from '../../models/public/ListValues.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/lists/$listId_/values/$listValueId/'

export const ListValue = () => {
  const { listValueId } = useParams({ from })
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const res = useLiveQuery(
    `SELECT * FROM list_values WHERE list_value_id = $1`,
    [listValueId],
  )
  const row: ListValues | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE list_values SET ${name} = $1 WHERE list_value_id = $2`,
        [value, listValueId],
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
      table: 'list_values',
      rowIdName: 'list_value_id',
      rowId: listValueId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="List Value" id={listValueId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextField
          label="Value"
          name="value"
          value={row.value ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations.value?.state}
          validationMessage={validations.value?.message}
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete}
          onChange={onChange}
          validationState={validations.obsolete?.state}
          validationMessage={validations.obsolete?.message}
        />
      </div>
    </div>
  )
}
