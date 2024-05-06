import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createFieldType } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: fieldTypes = [] } = useLiveQuery(
    db.field_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate({ pathname: data.field_type_id, search: searchParams.toString() })
  }, [db.field_types, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Field Types" addRow={add} tableName="field type" />
      <div className="list-container">
        {fieldTypes.map(({ field_type_id, label }) => (
          <Row
            key={field_type_id}
            label={label ?? field_type_id}
            to={field_type_id}
          />
        ))}
      </div>
    </div>
  )
}
