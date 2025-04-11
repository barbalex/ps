import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from = '/data/projects/$projectId_/lists/$listId_/values/$listValueId/'

export const ListValue = memo(() => {
  const { listValueId } = useParams({ from })
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM list_values WHERE list_value_id = $1`,
    [listValueId],
    'list_value_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE list_values SET ${name} = $1 WHERE list_value_id = $2`, [
        value,
        listValueId,
      ])
    },
    [db, listValueId, row],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="List Value"
        id={listValueId}
      />
    )
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
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete}
          onChange={onChange}
        />
      </div>
    </div>
  )
})
