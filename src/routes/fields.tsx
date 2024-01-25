import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createField } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.fields.liveMany({
      where: { project_id: project_id ?? null, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate(
      project_id
        ? `/projects/${project_id}/fields/${data.field_id}`
        : `/fields/${data.field_id}`,
    )
  }, [db.fields, navigate, project_id])

  const fields: Field[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Fields" addRow={add} tableName="field" />
      <div className="list-container">
        {fields.map(({ field_id, label }) => (
          <Row
            key={field_id}
            label={label}
            to={
              project_id
                ? `/projects/${project_id}/fields/${field_id}`
                : `/fields/${field_id}`
            }
          />
        ))}
      </div>
    </div>
  )
}
