import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'
import { createWidgetType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.widget_types.liveMany())

  const add = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate(`/widget-types/${data.widget_type_id}`)
  }, [db.widget_types, navigate])

  const rows: WidgetType[] = results ?? []

  // console.log('WidgetTypes', rows)

  return (
    <div className="list-view">
      <ListViewHeader
        title="Widget Types"
        addRow={add}
        tableName="widget type"
      />
      <div className="list-container">
        {rows.map(({ widget_type_id, label }) => (
          <Row
            key={widget_type_id}
            label={label}
            to={`/widget-types/${widget_type_id}`}
          />
        ))}
      </div>
    </div>
  )
}
