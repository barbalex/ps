import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createMessage } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
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
      <ListViewHeader title="Messages" addRow={add} tableName="message" />
      <div className="list-container">
        {messages.map(({ message_id, label }) => (
          <Row key={message_id} to={message_id} label={label ?? message_id} />
        ))}
      </div>
    </div>
  )
}
