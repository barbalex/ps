import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ActionReportValues as ActionReportValue } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { action_report_id, action_report_value_id } = useParams()
  const { results } = useLiveQuery(
    db.action_report_values.liveUnique({ where: { action_report_value_id } }),
  )

  const addItem = async () => {
    await db.action_report_values.create({
      data: {
        action_report_value_id: uuidv7(),
        action_report_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.action_report_values.deleteMany()
  }

  const actionReportValue: ActionReportValue = results

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
      <div>{`Action Report Value with id ${
        actionReportValue?.action_report_value_id ?? ''
      }`}</div>
    </div>
  )
}
