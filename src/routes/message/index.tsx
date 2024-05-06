import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { DateField } from '../../components/shared/DateField'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const Component = () => {
  const { message_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.messages.liveUnique({ where: { message_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.messages.update({
        where: { message_id },
        data: { [name]: value },
      })
    },
    [db.messages, message_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="message_id"
          value={row.message_id ?? ''}
        />
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
        />
        <TextField
          label="Message"
          name="message"
          value={row.message ?? ''}
          onChange={onChange}
          autoFocus
        />
      </div>
    </div>
  )
}
