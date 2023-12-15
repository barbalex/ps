import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { place_id, check_id } = useParams()
  const { results } = useLiveQuery(
    db.checks.liveUnique({ where: { check_id } }),
  )

  const addItem = async () => {
    await db.checks.create({
      data: {
        check_id: uuidv7(),
        place_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.checks.deleteMany()
  }

  const check: Check = results

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
      <div>{`Check with id ${check?.check_id ?? ''}`}</div>
    </div>
  )
}
