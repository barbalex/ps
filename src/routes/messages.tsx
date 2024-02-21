import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createMessage } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: messages = [] } = useLiveQuery(
    db.messages.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = createMessage()
    await db.messages.create({ data })
    navigate(`/messages/${data.message_id}`)
  }, [db.messages, navigate])

  return (
    <div className="list-view">
      <ListViewHeader title="Messages" addRow={add} tableName="message" />
      <div className="list-container">
        {messages.map(({ message_id, label }) => (
          <Row key={message_id} to={`/messages/${message_id}`} label={label} />
        ))}
      </div>
    </div>
  )
}
