import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from = '/data/users/$userId'

export const User = () => {
  const { userId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM users WHERE user_id = $1`, [userId])
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return
    const sql = `UPDATE users SET ${name} = $1 WHERE user_id = $2`
    db.query(sql, [value, userId])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="User"
        id={userId}
      />
    )
  }

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
}
