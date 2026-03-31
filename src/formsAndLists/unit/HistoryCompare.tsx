import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { stringifyHistoryValue } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { unitTypeOptions } from '../../modules/constants.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Units from '../../models/public/Units.ts'
import type UnitsHistory from '../../models/public/UnitsHistory.ts'

const from =
  '/data/projects/$projectId_/units/$unitId_/histories/$unitHistoryId'

export const UnitHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, unitId, unitHistoryId } = useParams({
    from,
    strict: false,
  })
  const unitPath = `/data/projects/${projectId}/units/${unitId}`
  const historyPath = `${unitPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM units WHERE unit_id = $1`, [
    unitId,
  ])
  const row = rowRes?.rows?.[0] as Units | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE units SET ${name} = $1 WHERE unit_id = $2`,
        [value, unitId],
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
      table: 'units',
      rowIdName: 'unit_id',
      rowId: unitId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'sTk6C3', defaultMessage: 'Einheit' })}
        id={unitId}
      />
    )
  }

  const unitTypeLabelMap = Object.fromEntries(
    unitTypeOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )
  const unitTypeList = unitTypeOptions.map((o) => o.value)

  const leftContent = (
    <div className="form-container">
      <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <RadioGroupField
        label={formatMessage({ id: 'uT5VwX', defaultMessage: 'Typ' })}
        name="type"
        list={unitTypeList}
        value={row.type ?? ''}
        onChange={onChange}
        validationState={validations?.type?.state}
        validationMessage={validations?.type?.message}
        labelMap={unitTypeLabelMap}
        layout="horizontal"
      />
      <SwitchField
        label={formatMessage({ id: 'Eh8IjK', defaultMessage: 'Summierbar' })}
        name="summable"
        value={row.summable ?? false}
        onChange={onChange}
        validationState={validations?.summable?.state}
        validationMessage={validations?.summable?.message}
      />
      <DropdownField
        label={formatMessage({
          id: 'Ls6dFg',
          defaultMessage: 'Liste (Werte aus Liste verwenden)',
        })}
        name="list_id"
        table="lists"
        where={`project_id = '${row.project_id}'`}
        value={row.list_id ?? ''}
        onChange={onChange}
        validationState={validations?.list_id?.state}
        validationMessage={validations?.list_id?.message}
        hideWhenNoData
      />
      <TextField
        label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortierwert' })}
        name="sort"
        type="number"
        value={row.sort ?? ''}
        onChange={onChange}
        validationState={validations?.sort?.state}
        validationMessage={validations?.sort?.message}
      />
      </>
    </div>
  )

  const visibleCurrentFields = new Set(['name', 'type', 'summable', 'list_id', 'sort'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      type: { id: 'uT5VwX', defaultMessage: 'Typ' },
      summable: { id: 'Eh8IjK', defaultMessage: 'Summierbar' },
      list_id: { id: 'Ls6dFg', defaultMessage: 'Liste (Werte aus Liste verwenden)' },
      sort: { id: 'Pq7nWk', defaultMessage: 'Sortierwert' },
    },
  })

  const formatFieldValue = (field: string, history: UnitsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<UnitsHistory>
      onBack={() => navigate({ to: unitPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'units_history',
        rowIdField: 'unit_id',
        rowId: unitId,
        historyPath,
        routeHistoryId: unitHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'units',
        rowIdName: 'unit_id',
        rowId: unitId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
