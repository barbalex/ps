import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { createPlace } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { subproject_id, project_id, place_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.places.liveMany({
      where: { deleted: false, parent_id: place_id ?? null },
    }),
  )

  const add = useCallback(async () => {
    const data = await createPlace({ db, project_id, subproject_id })
    if (place_id) {
      data.parent_id = place_id
      data.level = 2
    }
    await db.places.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${
        place_id ? `${place_id}/places/` : ''
      }${data.place_id}`,
    )
  }, [db, navigate, place_id, project_id, subproject_id])

  const places: Place[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="place" />
      {places.map((place: Place, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${
              place_id ? `${place_id}/places/` : ''
            }${place.place_id}`}
          >
            {place.label ?? place.place_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
