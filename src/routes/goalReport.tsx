import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { goal_id } = useParams()
  const { results } = useLiveQuery(
    db.goal_reports.liveUnique({ where: { goal_id } }),
  )

  const addItem = async () => {
    await db.goal_reports.create({
      data: {
        goal_report_id: uuidv7(),
        goal_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.goal_reports.deleteMany()
  }

  const goalReport: GoalReport = results

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
      <div>{`Goal Report with id ${goalReport?.goal_report_id ?? ''}`}</div>
    </div>
  )
}
