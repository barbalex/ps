import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

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

  // Keep a ref to the current goalReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const goalReportIdRef = useRef(goalReportId)
  useEffect(() => {
    goalReportIdRef.current = goalReportId
  }, [goalReportId])

  const addRow = async () => {
    const id = await createGoalReport({
      projectId,
      goalId,
    })
    navigate({
      to: isForm ? `../../${id}/report` : `../${id}/report`,
      params: (prev) => ({ ...prev, goalReportId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM goal_reports WHERE goal_report_id = $1`,
        [goalReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(`DELETE FROM goal_reports WHERE goal_report_id = $1`, [
        goalReportId,
      ])
      addOperation({
        table: 'goal_reports',
        rowIdName: 'goal_report_id',
        rowId: goalReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
        [goalId],
      )
      const goalReports = res?.rows
      const len = goalReports.length
      const index = goalReports.findIndex(
        (p) => p.goal_report_id === goalReportIdRef.current,
      )
      const next = goalReports[(index + 1) % len]
      navigate({
        to:
          isForm ?
            `../../${next.goal_report_id}/report`
          : `../${next.goal_report_id}`,
        params: (prev) => ({ ...prev, goalReportId: next.goal_report_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
        [goalId],
      )
      const goalReports = res?.rows
      const len = goalReports.length
      const index = goalReports.findIndex(
        (p) => p.goal_report_id === goalReportIdRef.current,
      )
      const previous = goalReports[(index + len - 1) % len]
      navigate({
        to:
          isForm ?
            `../../${previous.goal_report_id}/report`
          : `../${previous.goal_report_id}`,
        params: (prev) => ({ ...prev, goalReportId: previous.goal_report_id }),
      })
    } catch (error) {
      console.error(error)
    }
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
