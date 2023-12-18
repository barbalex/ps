import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.lists.liveMany())

  const add = async () => {
    await db.lists.create({
      data: {
        list_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.lists.deleteMany()
  }

  const lists: List[] = results ?? []

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
      {lists.map((list: List, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/lists/${list.list_id}`}>
            {list.list_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
