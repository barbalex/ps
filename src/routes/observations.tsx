import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as Observation } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createObservation } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.observations.liveMany({
      where: { observation_source_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createObservation({
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
    <div className="list-view">
      <ListViewHeader
        title="Observations"
        addRow={add}
        tableName="observation"
      />
      <div className="list-container">
        {observations.map(({ observation_id, label }) => (
          <Row
            key={observation_id}
            to={`/projects/${project_id}/observation-sources/${observation_source_id}/observations/${observation_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
