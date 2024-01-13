import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'
import { createFieldType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

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
    <div className="list-view">
      <ListViewHeader title="Field Types" addRow={add} tableName="field type" />
      <div className="list-container">
        {fieldTypes.map(({ field_type_id, label }) => (
          <Row
            key={field_type_id}
            label={label}
            to={`/field-types/${field_type_id}`}
          />
        ))}
      </div>
    </div>
  )
}
