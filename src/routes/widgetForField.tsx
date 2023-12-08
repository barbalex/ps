import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { WidgetsForFields as WidgetsForField } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { widget_for_field_id } = useParams()
  const { results } = useLiveQuery(
    db.widgets_for_fields.liveUnique({ where: { widget_for_field_id } }),
  )

  const addItem = async () => {
    await db.widgets_for_fields.create({
      data: {
        widget_for_field_id: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.widgets_for_fields.deleteMany()
  }

  const widgetForField: WidgetsForField = results

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
      <div>{`Widget For Field with id ${
        widgetForField?.widget_for_field_id ?? ''
      }`}</div>
    </div>
  )
}
