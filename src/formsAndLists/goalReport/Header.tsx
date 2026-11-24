import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { createGoalReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null>; from?: string }) => {
  const { projectId, subprojectId, goalId, goalReportId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()

  const db = usePGlite()
  const { formatMessage } = useIntl()
  const basePath = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}/reports/${goalReportId}`

  // Keep a ref to the current goalReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const goalReportIdRef = useRef(goalReportId)
  useEffect(() => {
    goalReportIdRef.current = goalReportId
  }, [goalReportId])

  const addRow = async () => {
    const id = await createGoalReport({
      projectId: projectId!,      goalId: goalId!,    })
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, goalReportId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'goal_reports',
      rowIdName: 'goal_report_id',
      rowId: goalReportId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
        [goalId],
      )
      const goalReports = res?.rows as { goal_report_id: string }[]
      const len = goalReports.length
      const index = goalReports.findIndex(
        (p) => p.goal_report_id === goalReportIdRef.current,
      )
      const next = goalReports[(index + 1) % len]
      navigate({
        to: `../${next.goal_report_id}`,
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
      const goalReports = res?.rows as { goal_report_id: string }[]
      const len = goalReports.length
      const index = goalReports.findIndex(
        (p) => p.goal_report_id === goalReportIdRef.current,
      )
      const previous = goalReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.goal_report_id}`,
        params: (prev) => ({ ...prev, goalReportId: previous.goal_report_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'KkGaeP', defaultMessage: 'Bericht' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="goal_reports_history"
          rowIdField="goal_report_id"
          rowId={goalReportId}
        />
      }
    />
  )
}
