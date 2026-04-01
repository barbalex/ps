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

import type SubprojectReportDesigns from '../../models/public/SubprojectReportDesigns.ts'
import type SubprojectReportDesignsHistory from '../../models/public/SubprojectReportDesignsHistory.ts'

const from =
  '/data/projects/$projectId_/subproject-designs/$subprojectReportDesignId_/histories/$subprojectReportDesignHistoryId'

export const SubprojectReportDesignHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectReportDesignId,
    subprojectReportDesignHistoryId,
  } = useParams({ from, strict: false })

  const formPath = `/data/projects/${projectId}/subproject-designs/${subprojectReportDesignId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(
    `SELECT * FROM subproject_report_designs WHERE subproject_report_design_id = $1`,
    [subprojectReportDesignId],
  )
  const row = rowRes?.rows?.[0] as SubprojectReportDesigns | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'bCBeFg',
          defaultMessage: 'Subprojekt-Bericht Design',
        })}
        id={subprojectReportDesignId}
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
    history: SubprojectReportDesignsHistory,
  ) => stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<SubprojectReportDesignsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'subproject_report_designs_history',
        rowIdField: 'subproject_report_design_id',
        rowId: subprojectReportDesignId,
        historyPath,
        routeHistoryId: subprojectReportDesignHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'subproject_report_designs',
        rowIdName: 'subproject_report_design_id',
        rowId: subprojectReportDesignId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
