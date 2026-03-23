import { useState } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { Delete } from '../../components/FormMenu/Delete.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import type PlaceReportQuantities from '../../models/public/PlaceReportQuantities.ts'
import type Units from '../../models/public/Units.ts'
import type ListValues from '../../models/public/ListValues.ts'

type Props = {
  placeReportQuantityId: string
  projectId: string
}

export const PlaceReportQuantityInline = ({
  placeReportQuantityId,
  projectId,
}: Props) => {
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_report_quantities WHERE place_report_quantity_id = $1`,
    [placeReportQuantityId],
  )
  const row: PlaceReportQuantities | undefined = res?.rows?.[0]

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
    if (row[name] === value) return
    try {
      await db.query(
        `UPDATE place_report_quantities SET ${name} = $1 WHERE place_report_quantity_id = $2`,
        [value, placeReportQuantityId],
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
      table: 'place_report_quantities',
      rowIdName: 'place_report_quantity_id',
      rowId: placeReportQuantityId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onListValueChange = async (valueStr: string | null) => {
    if (!unitValueField) return
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
        `UPDATE place_report_quantities SET ${unitValueField} = $1 WHERE place_report_quantity_id = $2`,
        [typedValue, placeReportQuantityId],
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
      const { [unitValueField]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'place_report_quantities',
      rowIdName: 'place_report_quantity_id',
      rowId: placeReportQuantityId,
      operation: 'update',
      draft: { [unitValueField]: typedValue },
      prev: { ...row },
    })
  }

  const deleteRow = async () => {
    try {
      await db.query(
        'DELETE FROM place_report_quantities WHERE place_report_quantity_id = $1',
        [placeReportQuantityId],
      )
      addOperation({
        table: 'place_report_quantities',
        rowIdName: 'place_report_quantity_id',
        rowId: placeReportQuantityId,
        operation: 'delete',
        prev: { ...row },
      })
    } catch (error) {
      console.error('Error deleting place report quantity:', error)
    }
  }

  if (!row) return null

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          rowGap: 15,
        }}
      >
        <RadioGroupField
          label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
          name="unit_id"
          list={unitIds}
          labelMap={unitLabelMap}
          isLoading={unitsRes === undefined}
          value={row.unit_id ?? ''}
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
        {selectedUnit?.list_id && hasListValues ? (
          listValues.length <= 5 ? (
            <RadioGroupField
              label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
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
              label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
              options={listValueIds}
              value={currentListValueStr}
              onChange={(e) => onListValueChange(e.target.value ?? null)}
              validationState={validations?.[unitValueField]?.state}
              validationMessage={validations?.[unitValueField]?.message}
            />
          )
        ) : (
          <>
            {(selectedUnit?.type === 'integer' ||
              row.quantity_integer !== null) && (
              <TextField
                label={
                  selectedUnit?.type !== 'integer'
                    ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (integer)`
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="quantity_integer"
                type="number"
                value={row.quantity_integer ?? ''}
                onChange={onChange}
                validationState={validations?.quantity_integer?.state}
                validationMessage={validations?.quantity_integer?.message}
              />
            )}
            {(selectedUnit?.type === 'numeric' ||
              row.quantity_numeric !== null) && (
              <TextField
                label={
                  selectedUnit?.type !== 'numeric'
                    ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (numeric)`
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="quantity_numeric"
                type="number"
                value={row.quantity_numeric ?? ''}
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
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="quantity_text"
                value={row.quantity_text ?? ''}
                onChange={onChange}
                validationState={validations?.quantity_text?.state}
                validationMessage={validations?.quantity_text?.message}
              />
            )}
          </>
        )}
      </div>
      <Delete
        deleteRow={deleteRow}
        deleteLabel={formatMessage({
          id: 'T4gSjD',
          defaultMessage: 'Menge löschen',
        })}
        deleteConfirmLabel={formatMessage({
          id: 'U5hTkE',
          defaultMessage: 'Menge löschen?',
        })}
      />
    </div>
  )
}
