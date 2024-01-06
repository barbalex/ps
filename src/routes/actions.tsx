import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { action as createAction } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.actions.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
      }),
    [place_id, place_id2],
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="action" />
      {actions.map((action: Action, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/actions/${action.action_id}`}
          >
            {action.label ?? action.action_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
