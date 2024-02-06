import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createAction } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { LayerMenu } from '../components/shared/LayerMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.actions.liveMany({
      where: { place_id: place_id2 ?? place_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${data.action_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const actions: Action[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Actions"
        addRow={add}
        tableName="action"
        menus={<LayerMenu table="actions" />}
      />
      <div className="list-container">
        {actions.map(({ action_id, label }) => (
          <Row
            key={action_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action_id}`}
          />
        ))}
      </div>
    </div>
  )
}
