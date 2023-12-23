import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { place as createPlacePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { subproject_id, project_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.places.liveMany())

  const add = useCallback(async () => {
    const newPlace = createPlacePreset()
    await db.places.create({
      data: { ...newPlace, subproject_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${newPlace.place_id}`,
    )
  }, [db.places, navigate, project_id, subproject_id])

  const places: Place[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {places.map((place: Place, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place.place_id}`}
          >
            {place.label ?? place.place_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
