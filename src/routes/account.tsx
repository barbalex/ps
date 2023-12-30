import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Accounts as Account } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { account as createAccountPreset } from '../modules/dataPresets'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { DateField } from '../components/shared/DateField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { account_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.accounts.liveUnique({ where: { account_id } }),
    [account_id],
  )

  const addRow = useCallback(async () => {
    const newAccount = createAccountPreset()
    await db.accounts.create({
      data: newAccount,
    })
    navigate(`/accounts/${newAccount.account_id}`)
  }, [db.accounts, navigate])

  const deleteRow = useCallback(async () => {
    await db.accounts.delete({
      where: {
        account_id,
      },
    })
    navigate(`/accounts`)
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
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="account" />
      <TextFieldInactive label="ID" name="account_id" value={row.account_id} />
      <DropdownField
        label="User"
        name="user_id"
        table="users"
        value={row.user_id ?? ''}
        onChange={onChange}
        autoFocus
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
  )
}
