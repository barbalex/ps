import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'
import { message as createMessagePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DateField } from '../components/shared/DateField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

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
    const newMessage = createMessagePreset()
    await db.messages.create({
      data: newMessage,
    })
    navigate(`/messages/${newMessage.message_id}`)
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
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="goal report value"
      />
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
      />
    </div>
  )
}
