import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { action as createActionPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.actions.liveMany({ where: { place_id, deleted: false } }),
    [place_id],
  )

  const add = useCallback(async () => {
    const newAction = createActionPreset()
    await db.actions.create({
      data: {
        ...newAction,
        place_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${newAction.action_id}`,
    )
  }, [db.actions, navigate, place_id, project_id, subproject_id])

  const actions: Action[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {actions.map((action: Action, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action.action_id}`}
          >
            {action.label ?? action.action_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
