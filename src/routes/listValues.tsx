import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { listValue as createListValuePreset } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    () => db.list_values.liveMany({ where: { list_id, deleted: false } }),
    [list_id],
  )

  const add = useCallback(async () => {
    const newListValue = createListValuePreset()
    await db.list_values.create({
      data: {
        ...newListValue,
        list_id,
      },
    })
    navigate(
      `/projects/${project_id}/lists/${list_id}/values/${newListValue.list_value_id}`,
    )
  }, [db.list_values, list_id, navigate, project_id])

  const listValues: ListValue[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="list value" />
      {listValues.map((listValue: ListValue, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/lists/${list_id}/values/${listValue.list_value_id}`}
          >
            {listValue.label ?? listValue.list_value_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
