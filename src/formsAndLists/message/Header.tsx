import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createMessage } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/messages/$messageId'

export const Header = memo(() => {
  const { messageId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    navigate({
      to: `/data/messages/${data.message_id}`,
      params: (prev) => ({ ...prev, messageId: data.message_id }),
    })
  }, [db, navigate])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM messages WHERE message_id = $1`, [messageId])
    navigate({ to: `/data/messages` })
  }, [db, messageId, navigate])

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
})
