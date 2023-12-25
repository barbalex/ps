import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { message as createMessagePreset } from '../modules/dataPresets'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.messages.liveMany())

  const add = useCallback(async () => {
    const newMessage = createMessagePreset()
    await db.messages.create({
      data: newMessage,
    })
    navigate(`/messages/${newMessage.message_id}`)
  }, [db.messages, navigate])

  const messages: Message[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {messages.map((message: Message, index: number) => (
        <p key={index} className="item">
          <Link to={`/messages/${message.message_id}`}>
            {message.label ?? message.message_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
