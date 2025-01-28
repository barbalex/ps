import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createMessage } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(() => {
  const { message_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = createMessage()
    await db.messages.create({ data })
    navigate({
      pathname: `../${data.message_id}`,
      search: searchParams.toString(),
    })
  }, [db.messages, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.messages.delete({
      where: { message_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.messages, message_id, navigate, searchParams])

  return (
    <FormHeader
      title="Message"
      addRow={addRow}
      deleteRow={deleteRow}
      tableName="message"
    />
  )
})
