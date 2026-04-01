import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ProjectReportForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectReports from '../../models/public/ProjectReports.ts'
import type ProjectReportsHistory from '../../models/public/ProjectReportsHistory.ts'

const from =
  '/data/projects/$projectId_/reports/$projectReportId_/histories/$projectReportHistoryId'

export const ProjectReportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectReportId, projectReportHistoryId } = useParams({
    from,
    strict: false,
  })

  const formPath = `/data/projects/${projectId}/reports/${projectReportId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM project_reports WHERE project_report_id = $1`,
    [projectReportId],
  )
  const row = rowRes?.rows?.[0] as ProjectReports | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE project_reports SET ${name} = $1 WHERE project_report_id = $2`,
        [value, projectReportId],
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
      table: 'project_reports',
      rowIdName: 'project_report_id',
      rowId: projectReportId,
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
          id: 'bB0++E',
          defaultMessage: 'Projekt-Bericht',
        })}
        id={projectReportId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ProjectReportForm
        row={row}
        onChange={onChange}
        validations={
          validations as Record<
            string,
            { state: string; message: string } | undefined
          >
        }
        from={from}
      />
    </div>
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      year: { id: 'bB4FgH', defaultMessage: 'Jahr' },
    },
  })

  const formatFieldValue = (field: string, history: ProjectReportsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ProjectReportsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'project_reports_history',
        rowIdField: 'project_report_id',
        rowId: projectReportId,
        historyPath,
        routeHistoryId: projectReportHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'project_reports',
        rowIdName: 'project_report_id',
        rowId: projectReportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
