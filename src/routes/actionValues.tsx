import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ActionValues as ActionValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id, action_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.action_values.liveMany())

  const add = useCallback(async () => {
    await db.action_values.create({
      data: {
        action_value_id: uuidv7(),
        action_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }, [action_id, db.action_values])

  const actionValues: ActionValue[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {actionValues.map((actionValue: ActionValue, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/actions/${action_id}/values/${actionValue.action_value_id}`}
          >
            {actionValue.action_value_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
