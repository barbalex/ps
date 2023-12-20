import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { WidgetsForFields as WidgetForField } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.widgets_for_fields.liveMany())

  const add = async () => {
    await db.widgets_for_fields.create({
      data: {
        widget_for_field_id: uuidv7(),
        deleted: false,
      },
    })
  }

  const clear = async () => {
    await db.widgets_for_fields.deleteMany()
  }

  const widgetsForFields: WidgetForField[] = results ?? []

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
      {widgetsForFields.map((widgetForField: WidgetForField, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/widgets-for-fields/${widgetForField.widget_for_field_id}`}
          >
            {widgetForField.widget_for_field_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
