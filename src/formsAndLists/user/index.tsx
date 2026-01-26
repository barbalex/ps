import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Users from '../../models/public/Users.ts'

import '../../form.css'

const from = '/data/users/$userId'

export const User = () => {
  const { userId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM users WHERE user_id = $1`, [userId])
  const row: Users | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return
    const sql = `UPDATE users SET ${name} = $1 WHERE user_id = $2`
    try {
      await db.query(sql, [value, userId])
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
      table: 'users',
      rowIdName: 'user_id',
      rowId: userId,
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
          <TextField
            label="Email"
            name="email"
            type="email"
            value={row.email ?? ''}
            onChange={onChange}
            autoFocus
            ref={autoFocusRef}
            validationState={validations?.email?.state}
            validationMessage={validations?.email?.message}
          />
        : <NotFound
            table="User"
            id={userId}
          />
        }
      </div>
    </div>
  )
}
