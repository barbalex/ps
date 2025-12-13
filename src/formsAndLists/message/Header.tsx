import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createMessage } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/messages/$messageId'

export const Header = () => {
  const { messageId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    navigate({
      to: `/data/messages/${data.message_id}`,
      params: (prev) => ({ ...prev, messageId: data.message_id }),
    })
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM messages WHERE message_id = $1`,
      [messageId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM messages WHERE message_id = $1`, [messageId])
    addOperation({
      table: 'messages',
      rowIdName: 'message_id',
      rowId: messageId,
      operation: 'delete',
      prev,
    })
    navigate({ to: `/data/messages` })
  }

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
}
