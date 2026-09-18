import { useRef } from 'react'
import type { ReactNode } from 'react'
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
import { chartTypeOptions } from '../../modules/constants.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Charts from '../../models/public/Charts.ts'
import type ChartsHistory from '../../models/public/ChartsHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/histories/$chartHistoryId'

export const ChartHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, chartId, chartHistoryId } = useParams({ strict: false })

  const formPath = `/data/projects/${projectId}/subprojects/${subprojectId}/charts/${chartId}/settings`
  const historyPath = `/data/projects/${projectId}/subprojects/${subprojectId}/charts/${chartId}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(`SELECT * FROM charts WHERE chart_id = $1`, [
    chartId,
  ])
  const row = rowRes?.rows?.[0] as Charts | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'vMlktr', defaultMessage: 'Diagramm' })}
        id={chartId}
      />
    )
  }

  const leftContent = <Form autoFocusRef={autoFocusRef} from={from} />

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      chart_type: { id: 'bCHkLm', defaultMessage: 'Diagramm-Typ' },
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      years_current: { id: 'bCJmNo', defaultMessage: 'Aktuelles Jahr' },
      years_previous: { id: 'bCLoQr', defaultMessage: 'Vorheriges Jahr' },
      years_specific: { id: 'bCNqSt', defaultMessage: 'Bestimmtes Jahr' },
      years_last_x: { id: 'bCPsUv', defaultMessage: 'Letzte X Jahre' },
      years_since: { id: 'bCRuWx', defaultMessage: 'Seit' },
      years_until: { id: 'bCTwYz', defaultMessage: 'Bis' },
      subjects_stacked: { id: 'bCVyAb', defaultMessage: 'Subjekte stapeln?' },
      subjects_single: {
        id: 'bCXaBd',
        defaultMessage: 'Subjekte in separaten Diagrammen darstellen?',
      },
      percent: {
        id: 'bCZcDf',
        defaultMessage: 'Bei mehreren Subjekten: Anteil als Prozent anzeigen?',
      },
    },
  })

  const chartTypeLabelMap = Object.fromEntries(
    chartTypeOptions.map(({ value, labelId, defaultMessage }) => [
      value,
      formatMessage({ id: labelId, defaultMessage }),
    ]),
  )

  const formatFieldValue = (
    field: string,
    history: ChartsHistory & Record<string, unknown>,
  ) => {
    if (field === 'chart_type') {
      const value = history[field]
      if (value !== null && value !== undefined) {
        return (chartTypeLabelMap[String(value)] ?? value) as ReactNode
      }
      return value
    }
    return stringifyHistoryValue((history as Record<string, unknown>)[field])
  }

  return (
    <HistoryCompare<ChartsHistory & Record<string, unknown>>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row as Charts & Record<string, unknown>}
      historyConfig={{
        historyTable: 'charts_history',
        rowIdField: 'chart_id',
        rowId: chartId,
        historyPath,
        routeHistoryId: chartHistoryId,
        currentRow: row as Charts & Record<string, unknown>,
      }}
      restoreConfig={{
        db,
        table: 'charts',
        rowIdName: 'chart_id',
        rowId: chartId,
        excludedRestoreFields,
        // the shared component types the operation as plain string
        addOperation: addOperation as unknown as (...args: unknown[]) => void,
      }}
    />
  )
}
