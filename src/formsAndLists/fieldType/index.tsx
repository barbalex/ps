import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { FieldTypeForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from = '/data/field-types/$fieldTypeId'

export const FieldType = memo(() => {
  const { fieldTypeId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM field_types WHERE field_type_id = $1`,
    [fieldTypeId],
    'field_type_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      const sql = `UPDATE field_types SET ${name} = $1 WHERE field_type_id = $2`
      db.query(sql, [value, fieldTypeId])
    },
    [db, fieldTypeId, row],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Field Type"
        id={fieldTypeId}
      />
    )
  }

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
