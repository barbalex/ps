import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createMessage } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const FormHeaderComponent = memo(() => {
  const { message_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const addRow = useCallback(async () => {
    const data = createMessage()
    await db.messages.create({ data })
    navigate(`/messages/${data.message_id}`)
  }, [db.messages, navigate])

  const deleteRow = useCallback(async () => {
    await db.messages.delete({
      where: { message_id },
    })
    navigate(`/messages`)
  }, [message_id, db.messages, navigate])

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
})
