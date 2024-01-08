import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createField } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.fields.liveMany({
        where: { project_id: project_id ?? null, deleted: false },
      }),
    [project_id],
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="field" />
      {fields.map((field: Field, index: number) => (
        <p key={index} className="item">
          <Link
            to={
              project_id
                ? `/projects/${project_id}/fields/${field.field_id}`
                : `/fields/${field.field_id}`
            }
          >
            {field.label ?? field.field_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
