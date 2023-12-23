import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { field as createFieldPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams<{
    project_id: string
  }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.fields.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const newField = createFieldPreset()
    await db.fields.create({
      data: {
        ...newField,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/fields/${newField.field_id}`)
  }, [db.fields, navigate, project_id])

  const fields: Field[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {fields.map((field: Field, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/fields/${field.field_id}`}>
            {field.label ?? field.field_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
