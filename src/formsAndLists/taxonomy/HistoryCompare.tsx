import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TaxonomyForm } from './Form.tsx'
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

import type Taxonomies from '../../models/public/Taxonomies.ts'
import type TaxonomiesHistory from '../../models/public/TaxonomiesHistory.ts'

const from =
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/histories/$taxonomyHistoryId'

export const TaxonomyHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, taxonomyId, taxonomyHistoryId } = useParams({
    from,
    strict: false,
  })
  const taxonomyPath = `/data/projects/${projectId}/taxonomies/${taxonomyId}/taxonomy`
  const historyPath = `/data/projects/${projectId}/taxonomies/${taxonomyId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM taxonomies WHERE taxonomy_id = $1`,
    [taxonomyId],
  )
  const row = rowRes?.rows?.[0] as Taxonomies | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE taxonomies SET ${name} = $1 WHERE taxonomy_id = $2`,
        [value, taxonomyId],
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
      table: 'taxonomies',
      rowIdName: 'taxonomy_id',
      rowId: taxonomyId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '6MNIJU', defaultMessage: 'Taxonomie' })}
        id={taxonomyId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <TaxonomyForm
        row={row}
        onChange={onChange}
        validations={validations as Record<string, { state: string; message: string }>}
        autoFocusRef={autoFocusRef}
        projectId={projectId}
      />
    </div>
  )

  const visibleCurrentFields = new Set([
    'name',
    'type',
    'unit_id',
    'url',
    'obsolete',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      type: { id: 'xTeBn/', defaultMessage: 'Typ' },
      unit_id: { id: 'bDkNqO', defaultMessage: 'Einheit' },
      url: { id: 'TpzCEx', defaultMessage: 'Url' },
      obsolete: { id: 'Ob2kQz', defaultMessage: 'Obsolet' },
    },
  })

  const formatFieldValue = (field: string, history: TaxonomiesHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<TaxonomiesHistory>
      onBack={() => navigate({ to: taxonomyPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'taxonomies_history',
        rowIdField: 'taxonomy_id',
        rowId: taxonomyId,
        historyPath,
        routeHistoryId: taxonomyHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'taxonomies',
        rowIdName: 'taxonomy_id',
        rowId: taxonomyId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
