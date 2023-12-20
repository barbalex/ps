import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams<{
    project_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.place_levels.liveMany())

  const add = async () => {
    await db.place_levels.create({
      data: {
        place_level_id: uuidv7(),
        project_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.place_levels.deleteMany()
  }

  const placeLevels: PlaceLevel[] = results ?? []

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
      {placeLevels.map((placeLevel: PlaceLevel, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/place-levels/${placeLevel.place_level_id}`}
          >
            {placeLevel.place_level_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
