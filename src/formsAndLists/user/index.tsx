import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const User = memo(() => {
  const { userId } = useParams({ from: '/data/_authLayout/users/$userId' })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM users WHERE user_id = $1`,
    [userId],
    'user_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return
      const sql = `UPDATE users SET ${name} = $1 WHERE user_id = $2`
      db.query(sql, [value, userId])
    },
    [db, row, userId],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextField
          label="Email"
          name="email"
          type="email"
          value={row.email ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
})
