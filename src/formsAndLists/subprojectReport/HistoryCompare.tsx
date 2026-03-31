import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { SubprojectReportForm } from './Form.tsx'
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

import type SubprojectReports from '../../models/public/SubprojectReports.ts'
import type SubprojectReportsHistory from '../../models/public/SubprojectReportsHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId_/histories/$subprojectReportHistoryId'

export const SubprojectReportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    subprojectReportId,
    subprojectReportHistoryId,
  } = useParams({ from, strict: false })

  const reportPath = `/data/projects/${projectId}/subprojects/${subprojectId}/reports/${subprojectReportId}`
  const historyPath = `${reportPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM subproject_reports WHERE subproject_report_id = $1`,
    [subprojectReportId],
  )
  const row = rowRes?.rows?.[0] as SubprojectReports | undefined

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
        `UPDATE subproject_reports SET ${name} = $1 WHERE subproject_report_id = $2`,
        [value, subprojectReportId],
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
      table: 'subproject_reports',
      rowIdName: 'subproject_report_id',
      rowId: subprojectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'OGDgRl', defaultMessage: 'Teilprojekt-Bericht' })}
        id={subprojectReportId}
      />
    )
  }

  return (
    <HistoryCompare<SubprojectReportsHistory>
      onBack={() => navigate({ to: reportPath })}
      leftContent={
        <div className="form-container">
          <SubprojectReportForm
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
        historyTable: 'subproject_reports_history',
        rowIdField: 'subproject_report_id',
        rowId: subprojectReportId,
        historyPath,
        routeHistoryId: subprojectReportHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'subproject_reports',
        rowIdName: 'subproject_report_id',
        rowId: subprojectReportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
