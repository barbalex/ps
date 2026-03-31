import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TaxonForm } from './Form.tsx'
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

import type Taxa from '../../models/public/Taxa.ts'
import type TaxaHistory from '../../models/public/TaxaHistory.ts'

const from =
  '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId_/histories/$taxonHistoryId'

export const TaxonHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, taxonomyId, taxonId, taxonHistoryId } = useParams({
    from,
    strict: false,
  })
  const taxonPath = `/data/projects/${projectId}/taxonomies/${taxonomyId}/taxa/${taxonId}`
  const historyPath = `${taxonPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM taxa WHERE taxon_id = $1`, [
    taxonId,
  ])
  const row = rowRes?.rows?.[0] as Taxa | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE taxa SET ${name} = $1 WHERE taxon_id = $2`, [
        value,
        taxonId,
      ])
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
      table: 'taxa',
      rowIdName: 'taxon_id',
      rowId: taxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'OSk4zO', defaultMessage: 'Taxon' })}
        id={taxonId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <TaxonForm
        row={row}
        onChange={onChange}
        validations={validations as Record<string, { state: string; message: string }>}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )

  const visibleCurrentFields = new Set(['name', 'id_in_source', 'url'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      id_in_source: { id: 'Fi9JkL', defaultMessage: 'ID in Quelle' },
      url: { id: 'TpzCEx', defaultMessage: 'Url' },
    },
  })

  const formatFieldValue = (field: string, history: TaxaHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<TaxaHistory>
      onBack={() => navigate({ to: taxonPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'taxa_history',
        rowIdField: 'taxon_id',
        rowId: taxonId,
        historyPath,
        routeHistoryId: taxonHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'taxa',
        rowIdName: 'taxon_id',
        rowId: taxonId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
