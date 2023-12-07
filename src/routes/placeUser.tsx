import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { PlaceUsers as PlaceUser } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { place_id, place_user_id } = useParams()
  const { results } = useLiveQuery(
    db.place_users.liveUnique({ where: { place_user_id } }),
  )

  const addItem = async () => {
    await db.place_users.create({
      data: {
        place_user_id: uuidv7(),
        place_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.place_users.deleteMany()
  }

  const placeUser: PlaceUser = results

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
      <div>{`Place User with id ${placeUser?.place_user_id ?? ''}`}</div>
    </div>
  )
}
