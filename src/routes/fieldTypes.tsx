import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'
import { fieldType as fieldTypePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.field_types.liveMany({
      where: { deleted: false },
      orderBy: [{ name: 'asc' }, { field_type_id: 'asc' }],
    }),
  )

  const add = async () => {
    const newFieldType = fieldTypePreset()
    await db.field_types.create({
      data: newFieldType,
    })
    navigate(`/field-types/${newFieldType.field_type_id}`)
  }

  const fieldTypes: FieldType[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {fieldTypes.map((fieldType: FieldType, index: number) => (
        <p key={index} className="item">
          <Link to={`/field-types/${fieldType.field_type_id}`}>
            {fieldType.label ?? fieldType.field_type_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
