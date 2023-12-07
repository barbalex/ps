import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { subproject_id, place_id } = useParams()
  const { results } = useLiveQuery(
    db.places.liveUnique({ where: { place_id } }),
  )

  const addItem = async () => {
    await db.places.create({
      data: {
        place_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.places.deleteMany()
  }

  const place: Place = results

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Place with id ${place?.place_id ?? ''}`}</div>
    </div>
  )
}
