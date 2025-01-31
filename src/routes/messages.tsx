import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createMessage } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: messages = [] } = useLiveQuery(
    db.messages.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = createMessage()
    await db.messages.create({ data })
    navigate({ pathname: data.message_id, search: searchParams.toString() })
  }, [db.messages, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Messages"
        addRow={add}
        tableName="message"
      />
      <div className="list-container">
        {messages.map(({ message_id, label }) => (
          <Row
            key={message_id}
            to={message_id}
            label={label ?? message_id}
          />
        ))}
      </div>
    </div>
  )
})
