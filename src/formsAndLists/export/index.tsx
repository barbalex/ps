import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { InputProps } from '@fluentui/react-components'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ExportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Exports from '../../models/public/Exports.ts'

import '../../form.css'

type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]

export const Export = () => {
  const { exportsId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM exports WHERE exports_id = $1`, [exportsId])
  const row = res?.rows?.[0] as Exports | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || (row as Record<string, any>)[name] === value) return

    const sql = `UPDATE exports SET ${name} = $1 WHERE exports_id = $2`
    try {
      await db.query(sql, [value, exportsId])
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
      table: 'exports',
      rowIdName: 'exports_id',
      rowId: exportsId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Export" id={exportsId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          validations={validations}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
}
