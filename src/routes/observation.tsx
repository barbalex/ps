import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Observations as Observation } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { observation_id, observation_source_id } = useParams()
  const { results } = useLiveQuery(
    db.observations.liveUnique({ where: { observation_id } }),
  )

  const addItem = async () => {
    await db.observations.create({
      data: {
        observation_id: uuidv7(),
        observation_source_id,
        // TODO: set account_id
      },
    })
  }

  const clearItems = async () => {
    await db.observations.deleteMany()
  }

  const observation: Observation = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Observation with id ${observation?.observation_id ?? ''}`}</div>
    </div>
  )
}
