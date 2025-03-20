import { useRef, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId/'

export const GoalReport = memo(() => {
  const { goalReportId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveIncrementalQuery(
    `SELECT * FROM goal_reports WHERE goal_report_id = $1`,
    [goalReportId],
    'goal_report_id',
  )
  const row = res?.rows?.[0]

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Jsonb
          table="goal_reports"
          idField="goal_report_id"
          id={row.goal_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
})
