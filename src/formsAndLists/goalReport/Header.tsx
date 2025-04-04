import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId/'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, goalId, goalReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createGoalReport({
      db,
      projectId,
      goalId,
    })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.goal_report_id}`,
      params: (prev) => ({ ...prev, goalReportId: data.goal_report_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, goalId, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM goal_reports WHERE goal_report_id = $1`, [
      goalReportId,
    ])
    navigate({ to: '..' })
  }, [db, goalReportId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
      [goalId],
    )
    const goalReports = res?.rows
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goalReportId,
    )
    const next = goalReports[(index + 1) % len]
    navigate({
      to: `../${next.goal_report_id}`,
      params: (prev) => ({ ...prev, goalReportId: next.goal_report_id }),
    })
  }, [db, goalId, goalReportId, navigate])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
      [goalId],
    )
    const goalReports = res?.rows
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goalReportId,
    )
    const previous = goalReports[(index + len - 1) % len]
    navigate({
      to: `../${previous.goal_report_id}`,
      params: (prev) => ({ ...prev, goalReportId: previous.goal_report_id }),
    })
  }, [db, goalId, goalReportId, navigate])

  return (
    <FormHeader
      title="Goal Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report"
    />
  )
})
