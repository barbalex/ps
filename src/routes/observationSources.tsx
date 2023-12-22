import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { observationSource as createObservationSourcePreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.observation_sources.liveMany({ where: { project_id } }),
    [project_id],
  )

  const add = async () => {
    const newObservationSource = createObservationSourcePreset()
    await db.observation_sources.create({
      data: {
        ...newObservationSource,
        project_id,
      },
    })
    navigate(
      `/projects/${project_id}/observation-sources/${newObservationSource.observation_source_id}`,
    )
  }

  const clear = async () => {
    await db.observation_sources.deleteMany()
  }

  const observationSources: ObservationSource[] = results ?? []

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
      {observationSources.map(
        (observationSource: ObservationSource, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${observationSource.project_id}/observation-sources/${observationSource.observation_source_id}`}
            >
              {observationSource.label ??
                observationSource.observation_source_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
