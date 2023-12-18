import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { list_id, list_value_id } = useParams()
  const { results } = useLiveQuery(
    db.list_values.liveUnique({ where: { list_value_id } }),
  )

  const addItem = async () => {
    await db.list_values.create({
      data: {
        list_value_id: uuidv7(),
        list_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.list_values.deleteMany()
  }

  const listValue: ListValue = results

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
      <div>{`List value with id ${listValue?.list_value_id ?? ''}`}</div>
    </div>
  )
}
