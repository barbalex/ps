import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { place as createPlacePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { labelFromData } from '../modules/labelFromData'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { subproject_id, project_id } = useParams<{
    subproject_id: string
    project_id: string
  }>()

  const { db } = useElectric()!
  const { results } = useLiveQuery(db.places.liveMany())

  const add = async () => {
    const newPlace = createPlacePreset()
    await db.places.create({
      data: newPlace,
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${newPlace.place_id}`,
    )
  }

  const clear = async () => {
    await db.places.deleteMany()
  }

  const places: Place[] = results ?? []

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
      {places.map((place: Place, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place.place_id}`}
          >
            {labelFromData({ data: place, table: 'places' })}
          </Link>
        </p>
      ))}
    </div>
  )
}
