import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { GoalReportValues as GoalReportValue } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { goal_report_id, goal_report_value_id } = useParams()
  const { results } = useLiveQuery(
    db.goal_report_values.liveUnique({ where: { goal_report_value_id } }),
  )

  const addItem = async () => {
    await db.goal_report_values.create({
      data: {
        goal_report_value_id: uuidv7(),
        goal_report_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.goal_report_values.deleteMany()
  }

  const goalReportValue: GoalReportValue = results

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
      <div>{`Goal Report Value with id ${
        goalReportValue?.goal_report_value_id ?? ''
      }`}</div>
    </div>
  )
}
