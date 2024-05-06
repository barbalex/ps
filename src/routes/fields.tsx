import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createField } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { project_id: project_id ?? null },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate({ pathname: data.field_id, search: searchParams.toString() })
  }, [db.fields, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Fields" addRow={add} tableName="field" />
      <div className="list-container">
        {fields.map(({ field_id, label }) => (
          <Row key={field_id} label={label ?? field_id} to={field_id} />
        ))}
      </div>
    </div>
  )
}
