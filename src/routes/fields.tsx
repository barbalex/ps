import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id } = useParams<{
    project_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.fields.liveMany())

  const add = async () => {
    await db.fields.create({
      data: {
        field_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.fields.deleteMany()
  }

  const fields: Field[] = results ?? []

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
      {fields.map((field: Field, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/fields/${field.field_id}`}>
            {field.field_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
