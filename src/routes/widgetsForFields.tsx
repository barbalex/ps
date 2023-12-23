import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { WidgetsForFields as WidgetForField } from '../../../generated/client'
import { widgetForField as createwidgetForFieldPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { deleted: false },
      orderBy: [{ widget_for_field_id: 'asc' }],
    }),
  )

  const add = useCallback(async () => {
    const newWidgetForField = createwidgetForFieldPreset()
    await db.widgets_for_fields.create({
      data: newWidgetForField,
    })
    navigate(`/widgets-for-fields/${newWidgetForField.widget_for_field_id}`)
  }, [db.widgets_for_fields, navigate])

  const widgetsForFields: WidgetForField[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {widgetsForFields.map((widgetForField: WidgetForField, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/widgets-for-fields/${widgetForField.widget_for_field_id}`}
          >
            {widgetForField.label ?? widgetForField.widget_for_field_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
