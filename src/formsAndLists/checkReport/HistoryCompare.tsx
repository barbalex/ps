import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { CheckReportForm } from './Form.tsx'
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

import type CheckReportsHistory from '../../models/public/CheckReportsHistory.ts'

export const CheckReportHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/histories/$checkReportHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/histories/$checkReportHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkReportId,
    checkReportHistoryId,
  } = useParams({
    from,
    strict: false,
  })

  const reportPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${checkReportId}/report`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${checkReportId}/report`

  const historyPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${checkReportId}/histories`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${checkReportId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM check_reports WHERE place_check_report_id = $1`,
    [checkReportId],
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
        `UPDATE check_reports SET ${name} = $1 WHERE place_check_report_id = $2`,
        [value, checkReportId],
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
      table: 'check_reports',
      rowIdName: 'place_check_report_id',
      rowId: checkReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'bCFgHi', defaultMessage: 'Bericht' })}
        id={checkReportId}
      />
    )
  }

  return (
    <HistoryCompare<CheckReportsHistory>
      onBack={() => navigate({ to: reportPath })}
      leftContent={
        <CheckReportForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'check_reports_history',
        rowIdField: 'place_check_report_id',
        rowId: checkReportId,
        historyPath,
        routeHistoryId: checkReportHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'check_reports',
        rowIdName: 'place_check_report_id',
        rowId: checkReportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
