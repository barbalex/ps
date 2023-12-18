import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { observation_source_id, project_id } = useParams()
  const { results } = useLiveQuery(
    db.observation_sources.liveUnique({ where: { observation_source_id } }),
  )

  const addItem = async () => {
    await db.observation_sources.create({
      data: {
        observation_source_id: uuidv7(),
        project_id,
        // TODO: set account_id
      },
    })
  }

  const clearItems = async () => {
    await db.observation_sources.deleteMany()
  }

  const observationSource: ObservationSource = results

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
      <div>{`Observation Source with id ${
        observationSource?.observation_source_id ?? ''
      }`}</div>
    </div>
  )
}
