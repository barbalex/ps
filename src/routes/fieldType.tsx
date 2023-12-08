import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { field_type } = useParams()
  const { results } = useLiveQuery(
    db.field_types.liveUnique({ where: { field_type } }),
  )

  const addItem = async () => {
    await db.field_types.create({
      data: {
        field_type: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.field_types.deleteMany()
  }

  const fieldType: FieldType = results

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
      <div>{`Field Type ${fieldType?.field_type ?? ''}`}</div>
    </div>
  )
}
