import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, unit_id } = useParams()
  const { results } = useLiveQuery(db.units.liveUnique({ where: { unit_id } }))

  const addItem = async () => {
    await db.units.create({
      data: {
        unit_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.units.deleteMany()
  }

  const unit: Unit = results

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
      <div>{`Unit with id ${unit?.unit_id ?? ''}`}</div>
    </div>
  )
}
