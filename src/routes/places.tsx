import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { createPlace } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id } = useParams()

  const { db } = useElectric()

  const { results } = useLiveQuery(
    db.places.liveMany({
      where: { deleted: false, parent_id: place_id ?? null, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const { results: placeLevels } = useLiveQuery(
    db.place_levels.liveMany({
      where: {
        deleted: false,
        project_id,
        level: place_id ? 2 : 1,
      },
      orderBy: { label: 'asc' },
    }),
  )
  const placeNameSingular = placeLevels?.[0]?.name_singular ?? 'Place'
  const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places${
    place_id ? `/${place_id}/places` : ''
  }`

  const add = useCallback(async () => {
    const data = await createPlace({
      db,
      project_id,
      subproject_id,
      place_id: place_id ?? null,
      level: place_id ? 2 : 1,
    })
    await db.places.create({ data })
    navigate(`${baseUrl}/${data.place_id}`)
  }, [baseUrl, db, navigate, place_id, project_id, subproject_id])

  const places: Place[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title={placeNamePlural}
        addRow={add}
        tableName={placeNameSingular}
      />
      <div className="list-container">
        {places.map(({ place_id, label }) => (
          <Row
            key={place_id}
            to={`${baseUrl}/${place_id}`}
            label={label ?? place_id}
          />
        ))}
      </div>
    </div>
  )
}
