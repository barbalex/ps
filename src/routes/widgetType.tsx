import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { WidgetTypes as WidgetType } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { widget_type } = useParams()
  const { results } = useLiveQuery(
    db.widget_types.liveUnique({ where: { widget_type } }),
  )

  const addItem = async () => {
    await db.widget_types.create({
      data: {
        widget_type: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.widget_types.deleteMany()
  }

  const widgetType: WidgetType = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Widget Type  ${widgetType?.widget_type ?? ''}`}</div>
    </div>
  )
}
