import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useNavigate } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.messages.liveMany())

  const add = useCallback(async () => {
    const newId = uuidv7()
    await db.messages.create({
      data: {
        message_id: newId,
      },
    })
    navigate(`/messages/${newId}`)
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
            {message.message_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
