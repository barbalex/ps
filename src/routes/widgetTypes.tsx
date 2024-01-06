import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'
import { widgetType as createWidgetType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'

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

  console.log('WidgetTypes', rows)

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="widget type" />
      {rows.map((widgetType: WidgetType, index: number) => (
        <p key={index} className="item">
          <Link to={`/widget-types/${widgetType.widget_type_id}`}>
            {widgetType.label ?? '(not set)'}
          </Link>
        </p>
      ))}
    </div>
  )
}
