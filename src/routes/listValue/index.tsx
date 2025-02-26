import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { list_value_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM list_values WHERE list_value_id = $1`,
    [list_value_id],
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(`UPDATE list_values SET ${name} = $1 WHERE list_value_id = $2`, [
        value,
        list_value_id,
      ])
    },
    [db, list_value_id],
  )

  if (!row) return <Loading />

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
