import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { CheckValues as CheckValue } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { check_id, check_value_id } = useParams()
  const { results } = useLiveQuery(
    db.check_values.liveUnique({ where: { check_value_id } }),
  )

  const addItem = async () => {
    await db.check_values.create({
      data: {
        check_value_id: uuidv7(),
        check_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.check_values.deleteMany()
  }

  const checkValue: CheckValue = results

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
      <div>{`Check Value with id ${checkValue?.check_value_id ?? ''}`}</div>
    </div>
  )
}
