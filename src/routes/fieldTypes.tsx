import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.field_types.liveMany())

  const add = async () => {
    await db.field_types.create({
      data: {
        field_type: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.field_types.deleteMany()
  }

  const fieldTypes: FieldType[] = results ?? []

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
      {fieldTypes.map((fieldType: FieldType, index: number) => (
        <p key={index} className="item">
          <Link to={`/field-types/${fieldType.field_type}`}>
            {fieldType.field_type}
          </Link>
        </p>
      ))}
    </div>
  )
}
