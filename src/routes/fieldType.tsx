import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { field_type_id } = useParams()
  const { results } = useLiveQuery(
    db.field_types.liveUnique({ where: {  field_type_id } }),
  )

  const addItem = async () => {
    await db.field_types.create({
      data: {
        field_type_id: uuidv7(),
        deleted: false,
      },
    })
  }

  const clearItems = async () => {
    await db.field_types.deleteMany()
  }

  const fieldType: FieldType = results

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
      <div>{`Field Type ${fieldType?.field_type_id ?? ''}`}</div>
    </div>
  )
}
