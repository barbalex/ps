import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, field_id } = useParams()
  const { results } = useLiveQuery(
    db.fields.liveUnique({ where: { field_id } }),
  )

  const addItem = async () => {
    await db.fields.create({
      data: {
        field_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.fields.deleteMany()
  }

  const field: Field = results

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
      <div>{`Field with id ${field?.field_id ?? ''}`}</div>
    </div>
  )
}
