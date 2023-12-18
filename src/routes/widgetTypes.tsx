import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.widget_types.liveMany())

  const add = async () => {
    await db.widget_types.create({
      data: {
        widget_type: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.widget_types.deleteMany()
  }

  const widgetTypes: WidgetType[] = results ?? []

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
      {widgetTypes.map((widgetType: WidgetType, index: number) => (
        <p key={index} className="item">
          <Link to={`/widget-types/${widgetType.widget_type}`}>
            {widgetType.widget_type}
          </Link>
        </p>
      ))}
    </div>
  )
}
