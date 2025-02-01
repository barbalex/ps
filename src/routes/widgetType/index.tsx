import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM widget_types WHERE widget_type_id = $1`,
    [widget_type_id],
  )
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const sql = `UPDATE widget_types SET ${name} = $1 WHERE widget_type_id = $2`
      db.query(sql, [value, widget_type_id])
    },
    [db, widget_type_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="widget_type_id"
          value={row.widget_type_id}
        />
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
})
