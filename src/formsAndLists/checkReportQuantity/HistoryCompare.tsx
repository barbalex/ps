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
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type CheckReportQuantitiesHistory from '../../models/public/CheckReportQuantitiesHistory.ts'
import type Units from '../../models/public/Units.ts'
import type ListValues from '../../models/public/ListValues.ts'

export const CheckReportQuantityHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/$checkReportQuantityId_/histories/$checkReportQuantityHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/quantities/$checkReportQuantityId_/histories/$checkReportQuantityHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkReportId,
    checkReportQuantityId,
    checkReportQuantityHistoryId,
  } = useParams({ from, strict: false })
  const checkReportQuantityPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${checkReportId}/quantities/${checkReportQuantityId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${checkReportId}/quantities/${checkReportQuantityId}`
  const historyPath = `${checkReportQuantityPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM check_report_quantities WHERE place_check_report_quantity_id = $1`,
    [checkReportQuantityId],
  )
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const unitsRes = useLiveQuery(
    `SELECT unit_id, name, type, list_id FROM units WHERE project_id = $1 ORDER BY sort, name`,
    [projectId],
  )
  const units: Pick<Units, 'unit_id' | 'name' | 'type' | 'list_id'>[] =
    unitsRes?.rows ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )
  const selectedUnit = units.find((u) => u.unit_id === row?.unit_id)

  const listValuesRes = useLiveQuery(
    `SELECT * FROM list_values WHERE list_id = $1 AND (obsolete IS NULL OR obsolete = false) ORDER BY value_integer, value_numeric, value_text, label`,
    [selectedUnit?.list_id ?? '00000000-0000-0000-0000-000000000000'],
  )
  const listValues: ListValues[] = listValuesRes?.rows ?? []
  const hasListValues = listValues.length > 0

  const unitValueField =
    selectedUnit?.type === 'integer'
      ? 'quantity_integer'
      : selectedUnit?.type === 'numeric'
        ? 'quantity_numeric'
        : selectedUnit?.type === 'text'
          ? 'quantity_text'
          : null

  const currentListValueStr = unitValueField
    ? (row?.[unitValueField]?.toString() ?? '')
    : ''

  const listValueOptions = listValues.map((lv) => ({
    value:
      (lv.value_integer ?? lv.value_numeric ?? lv.value_text)?.toString() ?? '',
    label: lv.label ?? '',
  }))
  const listValueIds = listValueOptions.map((o) => o.value)
  const listValueLabelMap = Object.fromEntries(
    listValueOptions.map((o) => [o.value, o.label]),
  )

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE check_report_quantities SET ${name} = $1 WHERE place_check_report_quantity_id = $2`,
        [value, checkReportQuantityId],
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
      table: 'check_report_quantities',
      rowIdName: 'place_check_report_quantity_id',
      rowId: checkReportQuantityId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onListValueChange = async (valueStr: string | null) => {
    if (!unitValueField || !row) return

    const typedValue =
      valueStr === null || valueStr === ''
        ? null
        : selectedUnit?.type === 'integer'
          ? parseInt(valueStr, 10)
          : selectedUnit?.type === 'numeric'
            ? parseFloat(valueStr)
            : valueStr

    if (row[unitValueField] === typedValue) return

    try {
      await db.query(
        `UPDATE check_report_quantities SET ${unitValueField} = $1 WHERE place_check_report_quantity_id = $2`,
        [typedValue, checkReportQuantityId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [unitValueField]: { state: 'error', message: error.message },
      }))
      return
    }

    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [unitValueField]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'check_report_quantities',
      rowIdName: 'place_check_report_quantity_id',
      rowId: checkReportQuantityId,
      operation: 'update',
      draft: { [unitValueField]: typedValue },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'bCPQmR',
          defaultMessage: 'Kontroll-Bericht-Menge',
        })}
        id={checkReportQuantityId}
      />
    )
  }

  const leftContent = (
    <>
      <RadioGroupField
        label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
        name="unit_id"
        list={unitIds}
        labelMap={unitLabelMap}
        isLoading={unitsRes === undefined}
        value={(row.unit_id as string | null) ?? ''}
        onChange={onChange}
        layout="horizontal"
        autoFocus
        ref={autoFocusRef}
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
      {selectedUnit?.list_id && hasListValues ? (
        listValues.length <= 5 ? (
          <RadioGroupField
            label={formatMessage({
              id: 'gRVMng',
              defaultMessage: 'Menge',
            })}
            name={unitValueField}
            list={listValueIds}
            labelMap={listValueLabelMap}
            value={currentListValueStr}
            onChange={(_e, data) => onListValueChange(data?.value ?? null)}
            layout="horizontal"
            validationState={validations?.[unitValueField]?.state}
            validationMessage={validations?.[unitValueField]?.message}
          />
        ) : (
          <DropdownFieldSimpleOptions
            name={unitValueField}
            label={formatMessage({
              id: 'gRVMng',
              defaultMessage: 'Menge',
            })}
            options={listValueIds}
            value={currentListValueStr}
            onChange={(e) => onListValueChange(e.target.value ?? null)}
            validationState={validations?.[unitValueField]?.state}
            validationMessage={validations?.[unitValueField]?.message}
          />
        )
      ) : (
        <>
          {(selectedUnit?.type === 'integer' || row.quantity_integer !== null) && (
            <TextField
              label={
                selectedUnit?.type !== 'integer'
                  ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (integer)`
                  : formatMessage({
                      id: 'gRVMng',
                      defaultMessage: 'Menge',
                    })
              }
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
              label={
                selectedUnit?.type !== 'numeric'
                  ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (numeric)`
                  : formatMessage({
                      id: 'gRVMng',
                      defaultMessage: 'Menge',
                    })
              }
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
              label={
                selectedUnit?.type !== 'text'
                  ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (text)`
                  : formatMessage({
                      id: 'gRVMng',
                      defaultMessage: 'Menge',
                    })
              }
              name="quantity_text"
              value={(row.quantity_text as string | null) ?? ''}
              onChange={onChange}
              validationState={validations?.quantity_text?.state}
              validationMessage={validations?.quantity_text?.message}
            />
          )}
        </>
      )}
    </>
  )

  const visibleCurrentFields = new Set([
    'unit_id',
    'quantity_integer',
    'quantity_numeric',
    'quantity_text',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      unit_id: { id: 'bDkNqO', defaultMessage: 'Einheit' },
      quantity_integer: { id: 'gRVMng', defaultMessage: 'Menge (integer)' },
      quantity_numeric: { id: 'bQuantityNumeric', defaultMessage: 'Menge (numeric)' },
      quantity_text: { id: 'bQuantityText', defaultMessage: 'Menge (text)' },
    },
  })

  const formatFieldValue = (
    field: string,
    history: CheckReportQuantitiesHistory,
  ) => {
    if (field === 'unit_id') {
      const unitId = history.unit_id
      if (!unitId) return ''
      return unitLabelMap[unitId] ?? unitId
    }
    return stringifyHistoryValue(history[field])
  }

  return (
    <HistoryCompare<CheckReportQuantitiesHistory>
      onBack={() => navigate({ to: checkReportQuantityPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'check_report_quantities_history',
        rowIdField: 'place_check_report_quantity_id',
        rowId: checkReportQuantityId,
        historyPath,
        routeHistoryId: checkReportQuantityHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'check_report_quantities',
        rowIdName: 'place_check_report_quantity_id',
        rowId: checkReportQuantityId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
