import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { stringifyHistoryValue } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type CheckTaxa from '../../models/public/CheckTaxa.ts'
import type CheckTaxaHistory from '../../models/public/CheckTaxaHistory.ts'
import type Units from '../../models/public/Units.ts'

export const CheckTaxonHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId_/histories/$checkTaxonHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/$checkTaxonId_/histories/$checkTaxonHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    checkTaxonId,
    checkTaxonHistoryId,
    checkId,
    projectId,
    subprojectId,
    placeId,
    placeId2,
  } = useParams({ from, strict: false })
  const checkTaxonPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/checks/${checkId}/taxa/${checkTaxonId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/checks/${checkId}/taxa/${checkTaxonId}`
  const historyPath = `${checkTaxonPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `WITH ct AS (
      SELECT * FROM check_taxa WHERE check_taxon_id = $1
    ), u AS (
      SELECT json_agg(json_build_object('unit_id', unit_id, 'name', name, 'type', type) ORDER BY sort, name) AS units_data
      FROM units WHERE project_id = $2
    )
    SELECT ct.*, u.units_data FROM ct, u`,
    [checkTaxonId, projectId],
  )
  const rawRow = rowRes?.rows?.[0] as
    | (Record<string, unknown> & {
        units_data: Pick<Units, 'unit_id' | 'name' | 'type'>[] | null
      })
    | undefined
  const row = rawRow as CheckTaxa | undefined
  const units: Pick<Units, 'unit_id' | 'name' | 'type'>[] =
    rawRow?.units_data ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )
  const selectedUnit = units.find((u) => u.unit_id === row?.unit_id)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE check_taxa SET ${name} = $1 WHERE check_taxon_id = $2`, [
        value,
        checkTaxonId,
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
      table: 'check_taxa',
      rowIdName: 'check_taxon_id',
      rowId: checkTaxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '1kFtKf', defaultMessage: 'Kontroll-Taxon' })}
        id={checkTaxonId}
      />
    )
  }

  const leftContent = (
    <>
      <DropdownField
        label={formatMessage({ id: 'OSk4zO', defaultMessage: 'Taxon' })}
        name="taxon_id"
        table="taxa"
        value={(row.taxon_id as string | null) ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.taxon_id?.state}
        validationMessage={validations?.taxon_id?.message}
      />
      <RadioGroupField
        label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
        name="unit_id"
        list={unitIds}
        labelMap={unitLabelMap}
        isLoading={rowRes === undefined}
        value={(row.unit_id as string | null) ?? ''}
        onChange={onChange}
        layout="horizontal"
        validationState={
          selectedUnit && !selectedUnit.type
            ? 'warning'
            : (validations?.unit_id?.state ?? 'none')
        }
        validationMessage={
          selectedUnit && !selectedUnit.type
            ? formatMessage({
                id: 'uN4VwX',
                defaultMessage:
                  'Mengen-Feld wird nicht angezeigt, weil die gewählte Einheit keinen Typ hat.',
              })
            : validations?.unit_id?.message
        }
      />
      {(selectedUnit?.type === 'integer' || row.quantity_integer !== null) && (
        <TextField
          label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
          name="quantity_integer"
          type="number"
          value={(row.quantity_integer as number | null) ?? ''}
          onChange={onChange}
          validationState={validations?.quantity_integer?.state}
          validationMessage={validations?.quantity_integer?.message}
        />
      )}
      {(selectedUnit?.type === 'numeric' || row.quantity_numeric !== null) && (
        <TextField
          label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
          name="quantity_numeric"
          type="number"
          value={(row.quantity_numeric as number | null) ?? ''}
          onChange={onChange}
          validationState={validations?.quantity_numeric?.state}
          validationMessage={validations?.quantity_numeric?.message}
        />
      )}
      {(selectedUnit?.type === 'text' || row.quantity_text !== null) && (
        <TextField
          label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
          name="quantity_text"
          value={(row.quantity_text as string | null) ?? ''}
          onChange={onChange}
          validationState={validations?.quantity_text?.state}
          validationMessage={validations?.quantity_text?.message}
        />
      )}
    </>
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      taxon_id: { id: 'OSk4zO', defaultMessage: 'Taxon' },
      unit_id: { id: 'bDkNqO', defaultMessage: 'Einheit' },
      quantity_integer: { id: 'gRVMng', defaultMessage: 'Menge (integer)' },
      quantity_numeric: {
        id: 'bQuantityNumeric',
        defaultMessage: 'Menge (numeric)',
      },
      quantity_text: { id: 'bQuantityText', defaultMessage: 'Menge (text)' },
    },
  })

  const formatFieldValue = (field: string, history: CheckTaxaHistory) => {
    if (field === 'unit_id') {
      const unitId = history.unit_id
      if (!unitId) return ''
      return unitLabelMap[unitId] ?? unitId
    }
    return stringifyHistoryValue(history[field])
  }

  const visibleCurrentFields = new Set([
    'taxon_id',
    'unit_id',
    'quantity_integer',
    'quantity_numeric',
    'quantity_text',
  ])

  return (
    <HistoryCompare<CheckTaxaHistory>
      onBack={() => navigate({ to: checkTaxonPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'check_taxa_history',
        rowIdField: 'check_taxon_id',
        rowId: checkTaxonId,
        historyPath,
        routeHistoryId: checkTaxonHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'check_taxa',
        rowIdName: 'check_taxon_id',
        rowId: checkTaxonId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
