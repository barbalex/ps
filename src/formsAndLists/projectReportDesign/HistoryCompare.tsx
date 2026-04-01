import { useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { Form } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectReportDesigns from '../../models/public/ProjectReportDesigns.ts'
import type ProjectReportDesignsHistory from '../../models/public/ProjectReportDesignsHistory.ts'

const from =
  '/data/projects/$projectId_/designs/$projectReportDesignId_/histories/$projectReportDesignHistoryId'

export const ProjectReportDesignHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectReportDesignId, projectReportDesignHistoryId } =
    useParams({ from, strict: false })

  const formPath = `/data/projects/${projectId}/designs/${projectReportDesignId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(
    `SELECT * FROM project_report_designs WHERE project_report_design_id = $1`,
    [projectReportDesignId],
  )
  const row = rowRes?.rows?.[0] as ProjectReportDesigns | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'bB7MnO',
          defaultMessage: 'Projekt-Bericht Design',
        })}
        id={projectReportDesignId}
      />
    )
  }

  const leftContent = (
    <Form autoFocusRef={autoFocusRef} from={from} />
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      active: { id: 'bC2VwX', defaultMessage: 'Aktiv' },
    },
  })

  const formatFieldValue = (
    field: string,
    history: ProjectReportDesignsHistory,
  ) => stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ProjectReportDesignsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'project_report_designs_history',
        rowIdField: 'project_report_design_id',
        rowId: projectReportDesignId,
        historyPath,
        routeHistoryId: projectReportDesignHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'project_report_designs',
        rowIdName: 'project_report_design_id',
        rowId: projectReportDesignId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
