import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createMessage } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveIncrementalQuery(
    `SELECT message_id, date FROM messages order by date desc`,
    undefined,
    'message_id',
  )
  const messages = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    if (!data) return
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
        {messages.map(({ message_id, date }) => (
          <Row
            key={message_id}
            to={message_id}
            label={date ?? message_id}
          />
        ))}
      </div>
    </div>
  )
})
