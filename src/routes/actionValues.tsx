import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionValues as ActionValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createActionValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_values.liveMany({ where: { action_id, deleted: false } }),
    [action_id],
  )

  const add = useCallback(async () => {
    const actionValue = createActionValue()
    await db.action_values.create({
      data: {
        ...actionValue,
        action_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/values/${actionValue.action_value_id}`,
    )
  }, [
    action_id,
    db.action_values,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const actionValues: ActionValue[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Values"
        addRow={add}
        tableName="action value"
      />
      <div className="list-container">
        {actionValues.map(({ action_value_id, label }) => (
          <Row
            key={action_value_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action_id}/values/${action_value_id}`}
          />
        ))}
      </div>
    </div>
  )
}
