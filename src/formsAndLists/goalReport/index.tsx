import { useRef } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const GoalReport = ({ from }) => {
  const { goalReportId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM goal_reports WHERE goal_report_id = $1`,
    [goalReportId],
  )
  const row = res?.rows?.[0]

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Goal Report"
        id={goalReportId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
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
}
