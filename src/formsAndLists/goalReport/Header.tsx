import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createGoalReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report'
  const { projectId, goalId, goalReportId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createGoalReport({
      db,
      projectId,
      goalId,
    })
    const data = res?.rows?.[0]
    navigate({
      to:
        isForm ?
          `../../${data.goal_report_id}/report`
        : `../${data.goal_report_id}/report`,
      params: (prev) => ({ ...prev, goalReportId: data.goal_report_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM goal_reports WHERE goal_report_id = $1`, [
      goalReportId,
    ])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
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
      to:
        isForm ?
          `../../${next.goal_report_id}/report`
        : `../${next.goal_report_id}`,
      params: (prev) => ({ ...prev, goalReportId: next.goal_report_id }),
    })
  }

  const toPrevious = async () => {
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
      to:
        isForm ?
          `../../${previous.goal_report_id}/report`
        : `../${previous.goal_report_id}`,
      params: (prev) => ({ ...prev, goalReportId: previous.goal_report_id }),
    })
  }

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
}
