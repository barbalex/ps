import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ActionReportForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ActionReportsHistory from '../../models/public/ActionReportsHistory.ts'

export const ActionReportHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/histories/$actionReportHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/histories/$actionReportHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionReportId,
    actionReportHistoryId,
  } = useParams({
    from,
    strict: false,
  })

  const reportPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/action-reports/${actionReportId}/report`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/action-reports/${actionReportId}/report`

  const historyPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/action-reports/${actionReportId}/histories`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/action-reports/${actionReportId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM action_reports WHERE place_action_report_id = $1`,
    [actionReportId],
  )
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const visibleCurrentFields = new Set(['year', 'data'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      year: { id: 'bB4FgH', defaultMessage: 'Jahr' },
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
    },
  })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE action_reports SET ${name} = $1 WHERE place_action_report_id = $2`,
        [value, actionReportId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }

    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'action_reports',
      rowIdName: 'place_action_report_id',
      rowId: actionReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'YMGqLf',
          defaultMessage: 'Massnahmen-Bericht',
        })}
        id={actionReportId}
      />
    )
  }

  return (
    <HistoryCompare<ActionReportsHistory>
      onBack={() => navigate({ to: reportPath })}
      leftContent={
        <div className="form-container">
          <ActionReportForm
            row={row}
            onChange={onChange}
            validations={validations}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        </div>
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'action_reports_history',
        rowIdField: 'place_action_report_id',
        rowId: actionReportId,
        historyPath,
        routeHistoryId: actionReportHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'action_reports',
        rowIdName: 'place_action_report_id',
        rowId: actionReportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
