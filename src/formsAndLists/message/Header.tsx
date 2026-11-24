import { useParams, useNavigate } from '@tanstack/react-router'

import { createMessage } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'


export const Header = () => {
  const { messageId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()

  const addRow = async () => {
    const id = await createMessage()
    if (!id) return
    navigate({
      to: `/data/messages/${id}`,
      params: (prev) => ({ ...prev, messageId: id }),
    })
  }

  const deleteRow = () =>
    requestDelete({
      table: 'messages',
      rowIdName: 'message_id',
      rowId: messageId!,
      navigateTo: '/data/messages',
    })

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
}
