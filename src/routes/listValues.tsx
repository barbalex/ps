import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createListValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
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
    const listValue = createListValue()
    await db.list_values.create({
      data: {
        ...listValue,
        list_id,
      },
    })
    navigate(
      `/projects/${project_id}/lists/${list_id}/values/${listValue.list_value_id}`,
    )
  }, [db.list_values, list_id, navigate, project_id])

  const listValues: ListValue[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="List Values" addRow={add} tableName="list value" />
      <div className="list-container">
        {listValues.map(({ list_value_id, label }) => (
          <Row
            key={list_value_id}
            to={`/projects/${project_id}/lists/${list_id}/values/${list_value_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
