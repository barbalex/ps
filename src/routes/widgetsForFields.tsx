import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { WidgetsForFields as WidgetForField } from '../../../generated/client'
import { createWidgetForField } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'

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
    const data = createWidgetForField()
    await db.widgets_for_fields.create({ data })
    navigate(`/widgets-for-fields/${data.widget_for_field_id}`)
  }, [db.widgets_for_fields, navigate])

  const widgetsForFields: WidgetForField[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Widgets for fields"
        addRow={add}
        tableName="widget for field"
      />
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
