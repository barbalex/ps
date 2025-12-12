import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from = '/data/accounts/$accountId'

export const Account = () => {
  const { accountId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM accounts WHERE account_id = $1`, [
    accountId,
  ])
  const row = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    const sql = `UPDATE accounts SET ${name} = $1 WHERE account_id = $2`
    try {
      await db.query(sql, [value, accountId])
    } catch (error) {
      console.error('error changing account:', error)
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Account"
        id={accountId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <DropdownField
          label="User"
          name="user_id"
          table="users"
          value={row.user_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <RadioGroupField
          label="Type"
          name="type"
          list={['free', 'basic', 'premium']}
          value={row.type ?? ''}
          onChange={onChange}
        />
        <DateField
          label="Starts"
          name="period_start"
          value={row.period_start}
          onChange={onChange}
        />
        <DateField
          label="Ends"
          name="period_end"
          value={row.period_end}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
