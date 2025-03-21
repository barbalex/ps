import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createMessage } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Messages = memo(() => {
  const navigate = useNavigate()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT message_id, date FROM messages order by date desc`,
    undefined,
    'message_id',
  )
  const isLoading = res === undefined
  const messages = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/messages/${data.message_id}`,
      params: (prev) => ({ ...prev, messageId: data.message_id }),
    })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Messages"
        nameSingular="message"
        tableName="messages"
        isFiltered={false}
        countFiltered={messages.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {messages.map(({ message_id, date }) => (
              <Row
                key={message_id}
                to={message_id}
                label={date ?? message_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
