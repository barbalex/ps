import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WidgetForFieldForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import type WidgetsForFields from '../../models/public/WidgetsForFields.ts'

import '../../form.css'

const from = '/data/widgets-for-fields/$widgetForFieldId'

export const WidgetForField = () => {
  const { widgetForFieldId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM widgets_for_fields WHERE widget_for_field_id = $1`,
    [widgetForFieldId],
  )
  const row: WidgetsForFields | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    const sql = `UPDATE widgets_for_fields SET ${name} = $1 WHERE widget_for_field_id = $2`
    try {
      await db.query(sql, [value, widgetForFieldId])
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
      table: 'widgets_for_fields',
      rowIdName: 'widget_for_field_id',
      rowId: widgetForFieldId,
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
          <Form onChange={onChange} validations={validations} row={row} autoFocusRef={autoFocusRef} />
        : <NotFound table="Widget For Field" id={widgetForFieldId} />
        }
      </div>
    </div>
  )
}
