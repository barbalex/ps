import { useState } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { InputOnChangeData } from '@fluentui/react-components'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { FieldForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Fields from '../../models/public/Fields.ts'

type Props = {
  fieldId?: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  isInForm?: boolean
  from?: string
}

// separate from the route because it is also used inside other forms
export const FieldFormFetchingOwnData = ({
  fieldId,
  autoFocusRef,
  isInForm = false,
  from,
}: Props) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const res = useLiveQuery(`SELECT * FROM fields WHERE field_id = $1`, [
    fieldId,
  ])
  const row = res?.rows?.[0] as Fields | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data!)
    // only change if value has changed: maybe only focus entered and left
    if (!row || (row as Record<string, any>)[name] === value) return

    try {
      await db.query(`UPDATE fields SET ${name} = $1 WHERE field_id = $2`, [
        value,
        fieldId,
      ])
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
        validations={validations}
        row={row as unknown as Record<string, unknown>}
        autoFocusRef={autoFocusRef}
        isInForm={isInForm}
        from={from}
      />
    </div>
  )
}
