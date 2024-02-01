import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DateField } from '../../components/shared/DateField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { message_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.messages.liveUnique({ where: { message_id } }),
  )

  const row: Message = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.messages.update({
        where: { message_id },
        data: { [name]: value },
      })
    },
    [db.messages, message_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

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
