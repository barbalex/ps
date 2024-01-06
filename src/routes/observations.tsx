import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as Observation } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { observation as createNewObservation } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
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

  const add = useCallback(async () => {
    const data = await createNewObservation({
      db,
      project_id,
      observation_source_id,
    })
    await db.observations.create({ data })
    navigate(
      `/projects/${project_id}/observation-sources/${observation_source_id}/observations/${data.observation_id}`,
    )
  }, [db, navigate, observation_source_id, project_id])

  const observations: Observation[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="observation" />
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
