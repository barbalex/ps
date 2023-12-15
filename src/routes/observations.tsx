import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ObservationSources as Observation } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams()

  const { db } = useElectric()!
  const { results } = useLiveQuery(db.observations.liveMany())

  const add = async () => {
    await db.observations.create({
      data: {
        observation_id: uuidv7(),
        observation_source_id,
        // TODO: set account_id
      },
    })
  }

  const clear = async () => {
    await db.observations.deleteMany()
  }

  const observations: Observation[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {observations.map((observation: Observation, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/observation-sources/${observation.observation_source_id}/observations/${observation.observation_id}`}
          >
            {observation.observation_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
