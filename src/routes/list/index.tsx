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
  const { list_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM lists WHERE list_id = $1`, [list_id])
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(`UPDATE lists SET ${name} = $1 WHERE list_id = $2`, [
        value,
        list_id,
      ])
    },
    [db, list_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="list_id"
          value={row.list_id}
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
