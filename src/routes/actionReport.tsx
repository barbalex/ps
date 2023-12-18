import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { action_id, action_report_id } = useParams()
  const { results } = useLiveQuery(
    db.action_reports.liveUnique({ where: { action_report_id } }),
  )

  const addItem = async () => {
    await db.action_reports.create({
      data: {
        action_report_id: uuidv7(),
        action_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.action_reports.deleteMany()
  }

  const actionReport: ActionReport = results

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
      <div>{`Action Report with id ${
        actionReport?.action_report_id ?? ''
      }`}</div>
    </div>
  )
}
