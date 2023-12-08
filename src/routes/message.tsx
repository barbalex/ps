import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Messages as Message } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { message_id } = useParams()
  const { results } = useLiveQuery(
    db.messages.liveUnique({ where: { message_id } }),
  )

  const addItem = async () => {
    await db.messages.create({
      data: {
        message_id: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.messages.deleteMany()
  }

  const message: Message = results

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Message with id ${message?.message_id ?? ''}`}</div>
    </div>
  )
}
