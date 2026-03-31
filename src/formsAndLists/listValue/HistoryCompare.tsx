import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
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

import type ListValues from '../../models/public/ListValues.ts'
import type ListValuesHistory from '../../models/public/ListValuesHistory.ts'
import type Lists from '../../models/public/Lists.ts'

export const ListValueHistoryCompare = ({
  from,
}: {
  from: '/data/projects/$projectId_/lists/$listId_/values/$listValueId_/histories/$listValueHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, listId, listValueId, listValueHistoryId } = useParams({
    from,
    strict: false,
  })
  const listValuePath = `/data/projects/${projectId}/lists/${listId}/values/${listValueId}`
  const historyPath = `${listValuePath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM list_values WHERE list_value_id IN (SELECT list_value_id FROM list_values_history WHERE list_value_id = $1 LIMIT 1)`,
    [listValueHistoryId?.split('-')[0] ?? ''],
  )
  const row = rowRes?.rows?.[0] as ListValues | undefined

  const listRes = useLiveQuery(
    `SELECT value_type FROM lists WHERE list_id = $1`,
    [listId],
  )
  const listValueType: Lists['value_type'] | undefined =
    listRes?.rows?.[0]?.value_type

  const formatDateForInput = (value: unknown) => {
    if (!value) return ''
    const dateValue = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(dateValue.getTime())) return ''
    return dateValue.toISOString().slice(0, 10)
  }

  const formatDateTimeForInput = (value: unknown) => {
    if (!value) return ''
    const dateValue = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(dateValue.getTime())) return ''
    return dateValue.toISOString().slice(0, 16)
  }

  const onChange = async (e, data) => {
    const { name, value: valueRaw } = getValueFromChange(e, data)
    const value =
      (name === 'value_date' || name === 'value_datetime') && valueRaw === ''
        ? null
        : valueRaw
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE list_values SET ${name} = $1 WHERE list_value_id = $2`,
        [value, row.list_value_id],
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
      table: 'list_values',
      rowIdName: 'list_value_id',
      rowId: row.list_value_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const valueField = (() => {
    if (!row) return null

    switch (listValueType) {
      case 'integer':
        return {
          name: 'value_integer',
          type: 'number',
          value: row.value_integer ?? '',
        }
      case 'numeric':
        return {
          name: 'value_numeric',
          type: 'number',
          value: row.value_numeric ?? '',
        }
      case 'text':
        return {
          name: 'value_text',
          type: 'text',
          value: row.value_text ?? '',
        }
      case 'date':
        return {
          name: 'value_date',
          type: 'date',
          value: formatDateForInput(row.value_date),
        }
      case 'datetime':
        return {
          name: 'value_datetime',
          type: 'datetime-local',
          value: formatDateTimeForInput(row.value_datetime),
        }
      default:
        return null
    }
  })()

  if (!rowRes || !listRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'QMOyrE',
          defaultMessage: 'Listen-Wert',
        })}
        id={listValueHistoryId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <>
        {!!valueField && (
          <TextField
            label={formatMessage({ id: 'ejuFAr', defaultMessage: 'Wert' })}
            name={valueField.name}
            type={valueField.type}
            value={valueField.value}
            onChange={onChange}
            validationState={validations?.[valueField.name]?.state}
            validationMessage={validations?.[valueField.name]?.message}
          />
        )}
        <SwitchField
          label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
          name="obsolete"
          value={row.obsolete}
          onChange={onChange}
          validationState={validations?.obsolete?.state}
          validationMessage={validations?.obsolete?.message}
        />
      </>
    </div>
  )

  const visibleCurrentFields = new Set(
    valueField ? [valueField.name, 'obsolete'] : ['obsolete'],
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      value_integer: { id: 'ejuFAr', defaultMessage: 'Wert' },
      value_numeric: { id: 'ejuFAr', defaultMessage: 'Wert' },
      value_text: { id: 'ejuFAr', defaultMessage: 'Wert' },
      value_date: { id: 'ejuFAr', defaultMessage: 'Wert' },
      value_datetime: { id: 'ejuFAr', defaultMessage: 'Wert' },
      obsolete: { id: 'Ob2kQz', defaultMessage: 'Obsolet' },
    },
  })

  const formatFieldValue = (field: string, history: ListValuesHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ListValuesHistory>
      onBack={() =>
        navigate({
          to: '/data/projects/$projectId_/lists/$listId_/values/$listValueId',
          params: {
            projectId,
            listId,
            listValueId: row.list_value_id,
          },
        })
      }
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'list_values_history',
        rowIdField: 'list_value_id',
        rowId: row.list_value_id,
        historyPath,
        routeHistoryId: listValueHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'list_values',
        rowIdName: 'list_value_id',
        rowId: row.list_value_id,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
