import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ExportForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Exports from '../../models/public/Exports.ts'
import type ExportsHistory from '../../models/public/ExportsHistory.ts'

const from =
  '/data/exports/$exportsId_/histories/$exportsHistoryId'

export const ExportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { exportsId, exportsHistoryId } = useParams({
    from,
    strict: false,
  })
  const exportPath = `/data/exports/${exportsId}`
  const historyPath = `${exportPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState({})

  const rowRes = useLiveQuery(
    `SELECT * FROM exports WHERE exports_id = $1`,
    [exportsId],
  )
  const row = rowRes?.rows?.[0] as Exports | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE exports SET ${name} = $1 WHERE exports_id = $2`,
        [value, exportsId],
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
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'exports',
      rowIdName: 'exports_id',
      rowId: exportsId,
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
          id: 'exports.nameSingular',
          defaultMessage: 'Export',
        })}
        id={exportsId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ExportForm
        onChange={onChange}
        validations={validations}
        row={row}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )

  const visibleCurrentFields = new Set([
    'name_de',
    'name_en',
    'name_fr',
    'name_it',
    'level',
    'filter_by_year',
    'description',
    'sql',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name_de: { id: 'export.nameDe', defaultMessage: 'Name (DE)' },
      name_en: { id: 'export.nameEn', defaultMessage: 'Name (EN)' },
      name_fr: { id: 'export.nameFr', defaultMessage: 'Name (FR)' },
      name_it: { id: 'export.nameIt', defaultMessage: 'Name (IT)' },
      level: { id: 'export.level', defaultMessage: 'Auf welcher Ebene wird exportiert?' },
      filter_by_year: { id: 'export.filterByYear', defaultMessage: 'Nach Jahr filtern' },
      description: { id: 'export.description', defaultMessage: 'Beschreibung' },
      sql: { id: 'export.sql', defaultMessage: 'SQL' },
    },
  })

  const formatFieldValue = (field: string, history: ExportsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ExportsHistory>
      onBack={() => navigate({ to: exportPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'exports_history',
        rowIdField: 'exports_id',
        rowId: exportsId,
        historyPath,
        routeHistoryId: exportsHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'exports',
        rowIdName: 'exports_id',
        rowId: exportsId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
