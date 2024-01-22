import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { WidgetsForFields as WidgetForField } from '../../../generated/client'
import { createWidgetForField } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
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
      <div className="list-container">
        {widgetsForFields.map(({ widget_for_field_id, label }) => (
          <Row
            key={widget_for_field_id}
            label={label}
            to={`/widgets-for-fields/${widget_for_field_id}`}
          />
        ))}
      </div>
    </div>
  )
}
