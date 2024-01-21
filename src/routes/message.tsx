import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'
import { createMessage } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { message_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.messages.liveUnique({ where: { message_id } }),
    [message_id],
  )

  const addRow = useCallback(async () => {
    const data = createMessage()
    await db.messages.create({ data })
    navigate(`/messages/${data.message_id}`)
  }, [db.messages, navigate])

  const deleteRow = useCallback(async () => {
    await db.messages.delete({
      where: {
        message_id,
      },
    })
    navigate(`/messages`)
  }, [message_id, db.messages, navigate])

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
      <FormHeader
        title="Message"
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="message"
      />
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
