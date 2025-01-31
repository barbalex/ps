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

  const result = useLiveQuery(
    `SELECT message_id, label FROM messages order by label asc`,
    [],
  )
  const messages = result?.rows ?? []

  const add = useCallback(async () => {
    const data = createMessage()
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into messages (${columns}) values ($1)`
    await db.query(sql, values)
    navigate({ pathname: data.message_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Messages"
        nameSingular="message"
        tableName="messages"
        isFiltered={false}
        countFiltered={messages.length}
        addRow={add}
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
