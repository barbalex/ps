import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'
import { fieldType as createFieldType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'

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

  const add = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate(`/field-types/${data.field_type_id}`)
  }, [db.field_types, navigate])

  const fieldTypes: FieldType[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="field type" />
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
