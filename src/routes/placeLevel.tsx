import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Fields as Field } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, place_level_id } = useParams()
  const { results } = useLiveQuery(
    db.place_levels.liveUnique({ where: { place_level_id } }),
  )

  const addItem = async () => {
    await db.place_levels.create({
      data: {
        place_level_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.place_levels.deleteMany()
  }

  const placeLevel: Field = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Place level with id ${placeLevel?.place_level_id ?? ''}`}</div>
    </div>
  )
}
