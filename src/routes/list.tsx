import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, list_id } = useParams()
  const { results } = useLiveQuery(db.lists.liveUnique({ where: { list_id } }))

  const addItem = async () => {
    await db.lists.create({
      data: {
        list_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.lists.deleteMany()
  }

  const list: List = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`List with id ${list?.list_id ?? ''}`}</div>
    </div>
  )
}
