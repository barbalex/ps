import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createObservationSource } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.observation_sources.liveMany({
      where: { project_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createObservationSource({
      db,
      project_id,
    })
    await db.observation_sources.create({ data })
    navigate(
      `/projects/${project_id}/observation-sources/${data.observation_source_id}`,
    )
  }, [db, navigate, project_id])

  const observationSources: ObservationSource[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Observation Sources"
        addRow={add}
        tableName="observation source"
      />
      <div className="list-container">
        {observationSources.map(({ observation_source_id, label }) => (
          <Row
            key={observation_source_id}
            to={`/projects/${project_id}/observation-sources/${observation_source_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
