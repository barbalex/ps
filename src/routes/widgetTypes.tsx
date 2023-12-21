import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'
import { widgetType as createWidgetTypePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.widget_types.liveMany())

  const add = async () => {
    const newWidgetType = createWidgetTypePreset()
    await db.widget_types.create({
      data: newWidgetType,
    })
    navigate(`/widget-types/${newWidgetType.widget_type_id}`)
  }

  const clear = async () => {
    await db.widget_types.deleteMany()
  }

  const rows: WidgetType[] = results ?? []

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
      {rows.map((widgetType: WidgetType, index: number) => (
        <p key={index} className="item">
          <Link to={`/widget-types/${widgetType.widget_type_id}`}>
            {rows.label ?? widgetType.widget_type_id ?? '(not set)'}
          </Link>
        </p>
      ))}
    </div>
  )
}
