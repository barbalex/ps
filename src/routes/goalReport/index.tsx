import { useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { FormHeaderComponent } from './FormHeader'

import '../../form.css'

export const Component = () => {
  const { goal_report_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.goal_reports.liveUnique({ where: { goal_report_id } }),
  )

  const row: GoalReport = results

  // console.log('goalReport', { row, goal_id })

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeaderComponent autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="goal_report_id"
          value={row.goal_report_id ?? ''}
        />
        <Jsonb
          table="goal_reports"
          idField="goal_report_id"
          id={row.goal_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
