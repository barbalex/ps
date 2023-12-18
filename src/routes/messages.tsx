import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.messages.liveMany())

  const add = async () => {
    await db.messages.create({
      data: {
        message_id: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.messages.deleteMany()
  }

  const messages: Message[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {messages.map((message: Message, index: number) => (
        <p key={index} className="item">
          <Link to={`/messages/${message.message_id}`}>{message.message_id}</Link>
        </p>
      ))}
    </div>
  )
}
