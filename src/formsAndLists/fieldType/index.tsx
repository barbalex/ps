import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { InputOnChangeData } from '@fluentui/react-components'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { FieldTypeForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type FieldTypes from '../../models/public/FieldTypes.ts'

import '../../form.css'

export const FieldType = () => {
  const { fieldTypeId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM field_types WHERE field_type_id = $1`,
    [fieldTypeId],
  )
  const row = res?.rows?.[0] as FieldTypes | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data!)
    // only change if value has changed: maybe only focus entered and left
    if (!row || (row as Record<string, any>)[name] === value) return

    const sql = `UPDATE field_types SET ${name} = $1 WHERE field_type_id = $2`
    try {
      await db.query(sql, [value, fieldTypeId])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }
    setValidations((prev) => {
       
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'field_types',
      rowIdName: 'field_type_id',
      rowId: fieldTypeId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {!res ?
          <Loading />
        : row ?
          <Form
            onChange={onChange}
            validations={validations}
            row={row as unknown as Record<string, unknown>}
            autoFocusRef={autoFocusRef}
          />
        : <NotFound table="Field Type" id={fieldTypeId} />
        }
      </div>
    </div>
  )
}
