import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ComboboxFilteringForTable } from '../../components/shared/ComboboxFilteringForTable/index.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { stringifyHistoryValue } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type SubprojectTaxa from '../../models/public/SubprojectTaxa.ts'
import type SubprojectTaxaHistory from '../../models/public/SubprojectTaxaHistory.ts'

const taxaInclude = { taxonomies: true }

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId_/histories/$subprojectTaxonHistoryId'

export const SubprojectTaxonHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const taxonFieldLabel = { id: 'OSk4zO', defaultMessage: 'Taxon' } as const
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    subprojectTaxonId,
    subprojectTaxonHistoryId,
  } = useParams({ from, strict: false })
  const subprojectTaxonPath = `/data/projects/${projectId}/subprojects/${subprojectId}/taxa/${subprojectTaxonId}`
  const historyPath = `${subprojectTaxonPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM subproject_taxa WHERE subproject_taxon_id = $1`,
    [subprojectTaxonId],
  )
  const row = rowRes?.rows?.[0] as SubprojectTaxa | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_taxa SET ${name} = $1 WHERE subproject_taxon_id = $2`,
        [value, subprojectTaxonId],
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
      table: 'subproject_taxa',
      rowIdName: 'subproject_taxon_id',
      rowId: subprojectTaxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound table={formatMessage(taxonFieldLabel)} id={subprojectTaxonId} />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ComboboxFilteringForTable
        label={formatMessage(taxonFieldLabel)}
        name="taxon_id"
        table="taxa"
        include={taxaInclude}
        value={row.taxon_id ?? ''}
        onChange={onChange}
        validationState={validations?.taxon_id?.state}
        validationMessage={validations?.taxon_id?.message}
      />
    </div>
  )

  const visibleCurrentFields = new Set(['taxon_id'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      taxon_id: taxonFieldLabel,
    },
  })

  const formatFieldValue = (field: string, history: SubprojectTaxaHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<SubprojectTaxaHistory>
      onBack={() => navigate({ to: subprojectTaxonPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'subproject_taxa_history',
        rowIdField: 'subproject_taxon_id',
        rowId: subprojectTaxonId,
        historyPath,
        routeHistoryId: subprojectTaxonHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'subproject_taxa',
        rowIdName: 'subproject_taxon_id',
        rowId: subprojectTaxonId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
