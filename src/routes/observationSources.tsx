import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { observationSource as createNewObservationSource } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.observation_sources.liveMany({ where: { project_id } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const data = await createNewObservationSource({
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="observation source" />
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
