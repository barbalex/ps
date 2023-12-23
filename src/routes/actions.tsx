import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Actions as Action } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.actions.liveMany())

  const add = useCallback(async () => {
    await db.actions.create({
      data: {
        action_id: uuidv7(),
        place_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }, [db.actions, place_id])

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
            {action.action_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
