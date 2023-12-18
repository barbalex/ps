import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id, list_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.list_values.liveMany())

  const add = async () => {
    await db.list_values.create({
      data: {
        list_value_id: uuidv7(),
        list_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.list_values.deleteMany()
  }

  const listValues: ListValue[] = results ?? []

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
      {listValues.map((listValue: ListValue, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/lists/${list_id}/values/${listValue.list_value_id}`}
          >
            {listValue.list_value_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
