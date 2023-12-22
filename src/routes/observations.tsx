import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as Observation } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { observation as createObservationPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    () =>
      db.observations.liveMany({
        where: { observation_source_id, deleted: false },
      }),
    [project_id, observation_source_id],
  )

  const add = async () => {
    const newObservation = createObservationPreset()
    await db.observations.create({
      data: {
        ...newObservation,
        observation_source_id,
      },
    })
    navigate(
      `/projects/${project_id}/observation-sources/${observation_source_id}/observations/${newObservation.observation_id}`,
    )
  }

  const observations: Observation[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {observations.map((observation: Observation, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/observation-sources/${observation.observation_source_id}/observations/${observation.observation_id}`}
          >
            {observation.label ?? observation.observation_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
