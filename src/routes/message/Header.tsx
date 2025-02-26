import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createMessage } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(() => {
  const { message_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.message_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM messages WHERE message_id = $1`, [message_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, message_id, navigate, searchParams])

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
})
