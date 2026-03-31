import { useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'
import { addOperationAtom } from '../../store.ts'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import type GoalReports from '../../models/public/GoalReports.ts'
import type GoalReportsHistory from '../../models/public/GoalReportsHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/histories/$goalReportHistoryId'

export const GoalReportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, goalId, goalReportId, goalReportHistoryId } =
    useParams({ from, strict: false })
  const goalReportPath = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}/reports/${goalReportId}`
  const historyPath = `${goalReportPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(
    `SELECT * FROM goal_reports WHERE goal_report_id = $1`,
    [goalReportId],
  )
  const row = rowRes?.rows?.[0] as GoalReports | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'KkGaeP', defaultMessage: 'Bericht' })}
        id={goalReportId}
      />
    )
  }

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
    },
  })

  return (
    <HistoryCompare<GoalReportsHistory>
      onBack={() => navigate({ to: goalReportPath })}
      leftContent={
        <Jsonb
          table="goal_reports"
          idField="goal_report_id"
          id={row.goal_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
          from={from}
        />
      }
      visibleCurrentFields={new Set(['data'])}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row as Record<string, unknown>}
      historyConfig={{
        historyTable: 'goal_reports_history',
        rowIdField: 'goal_report_id',
        rowId: goalReportId,
        historyPath,
        routeHistoryId: goalReportHistoryId,
        currentRow: row as Record<string, unknown>,
      }}
      restoreConfig={{
        db,
        table: 'goal_reports',
        rowIdName: 'goal_report_id',
        rowId: goalReportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
