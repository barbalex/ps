import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { ObservationSources as Observation } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createObservation } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.observations.liveMany({
      where: { observation_source_id },
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
    navigate({ pathname: data.observation_id, search: searchParams.toString() })
  }, [db, navigate, observation_source_id, project_id, searchParams])

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
          <Row key={observation_id} to={observation_id} label={label} />
        ))}
      </div>
    </div>
  )
}
