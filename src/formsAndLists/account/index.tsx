import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import '../../form.css'
import type Accounts from '../../models/public/Accounts.ts'

const from = '/data/accounts/$accountId'

export const Account = () => {
  const { accountId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM accounts WHERE account_id = $1`, [
    accountId,
  ])
  const row: Accounts | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    // Validate period dates
    if (name === 'period_start' || name === 'period_end') {
      const startDate = name === 'period_start' ? value : row.period_start
      const endDate = name === 'period_end' ? value : row.period_end

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setValidations((prev) => ({
          ...prev,
          [name]: {
            state: 'error',
            message: 'End date must be after start date',
          },
        }))
        return
      } else {
        // remove all date related validations if any
        setValidations((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { period_start, period_end, ...rest } = prev
          return rest
        })
      }
    }

    try {
      await db.query(`UPDATE accounts SET ${name} = $1 WHERE account_id = $2`, [
        value,
        accountId,
      ])
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
      table: 'accounts',
      rowIdName: 'account_id',
      rowId: accountId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
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
          validationState={validations?.user_id?.state}
          validationMessage={validations?.user_id?.message}
        />
        <RadioGroupField
          label="Type"
          name="type"
          list={['trial', 'free', 'basic', 'premium']}
          value={row.type ?? ''}
          onChange={onChange}
          validationState={validations?.type?.state}
          validationMessage={validations?.type?.message}
        />
        <DateField
          label="Starts"
          name="period_start"
          value={row.period_start}
          onChange={onChange}
          validationState={validations?.period_start?.state}
          validationMessage={validations?.period_start?.message}
        />
        <DateField
          label="Ends"
          name="period_end"
          value={row.period_end}
          onChange={onChange}
          validationState={validations?.period_end?.state}
          validationMessage={validations?.period_end?.message}
        />
      </div>
    </div>
  )
}
