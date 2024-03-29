import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createWidgetForField } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createWidgetForField()
    await db.widgets_for_fields.create({ data })
    navigate({
      pathname: data.widget_for_field_id,
      search: searchParams.toString(),
    })
  }, [db.widgets_for_fields, navigate, searchParams])

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
            to={widget_for_field_id}
          />
        ))}
      </div>
    </div>
  )
}
