import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { account_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.accounts.liveUnique({ where: { account_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.accounts.update({
        where: { account_id },
        data: { [name]: value },
      })
    },
    [db.accounts, account_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
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
})
