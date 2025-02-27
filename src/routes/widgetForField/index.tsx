import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const result = useLiveIncrementalQuery(
    `SELECT * FROM widgets_for_fields WHERE widget_for_field_id = $1`,
    [widget_for_field_id],
    'widget_for_field_id',
  )
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const sql = `UPDATE widgets_for_fields SET ${name} = $1 WHERE widget_for_field_id = $2`
      db.query(sql, [value, widget_for_field_id])
    },
    [db, widget_for_field_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
})
