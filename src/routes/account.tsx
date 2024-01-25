import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createAccount } from '../modules/createRows'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { DateField } from '../components/shared/DateField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { account_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.accounts.liveUnique({ where: { account_id } }),
  )

  const addRow = useCallback(async () => {
    const data = createAccount()
    await db.accounts.create({ data })
    navigate(`/accounts/${data.account_id}`)
    autoFocusRef.current?.focus()
  }, [db.accounts, navigate])

  const deleteRow = useCallback(async () => {
    await db.accounts.delete({
      where: {
        account_id,
      },
    })
    navigate(`/accounts`)
  }, [account_id, db.accounts, navigate])

  const toNext = useCallback(async () => {
    const accounts = await db.accounts.findMany({
      orderBy: { label: 'asc' },
    })
    const len = accounts.length
    const index = accounts.findIndex((p) => p.account_id === account_id)
    const next = accounts[(index + 1) % len]
    navigate(`/accounts/${next.account_id}`)
  }, [account_id, db.accounts, navigate])

  const toPrevious = useCallback(async () => {
    const accounts = await db.accounts.findMany({
      orderBy: { label: 'asc' },
    })
    const len = accounts.length
    const index = accounts.findIndex((p) => p.account_id === account_id)
    const previous = accounts[(index + len - 1) % len]
    navigate(`/accounts/${previous.account_id}`)
  }, [account_id, db.accounts, navigate])

  const row: Account = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.accounts.update({
        where: { account_id },
        data: { [name]: value },
      })
    },
    [db.accounts, account_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Account"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="account"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="account_id"
          value={row.account_id}
        />
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
