import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { FieldForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  createHistoryFieldValueFormatter,
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

import type Fields from '../../models/public/Fields.ts'
import type FieldsHistory from '../../models/public/FieldsHistory.ts'

export const FieldHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/fields/$fieldId_/histories/$fieldHistoryId'
    | '/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId_/histories/$fieldHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, userId, accountId, fieldId, fieldHistoryId } = useParams({
    from,
    strict: false,
  })
  const fieldPath = projectId
    ? `/data/projects/${projectId}/fields/${fieldId}`
    : `/data/users/${userId}/accounts/${accountId}/project-fields/${fieldId}`
  const historyPath = `${fieldPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM fields WHERE field_id = $1`, [
    fieldId,
  ])
  const row = rowRes?.rows?.[0] as Fields | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE fields SET ${name} = $1 WHERE field_id = $2`, [
        value,
        fieldId,
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
      table: 'fields',
      rowIdName: 'field_id',
      rowId: fieldId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '61ELuB', defaultMessage: 'Feld' })}
        id={fieldId}
      />
    )
  }

  const visibleCurrentFields = new Set([
    'table_name',
    'level',
    'name',
    'field_label',
    'field_type_id',
    'widget_type_id',
    'list_id',
    'preset',
    'obsolete',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      table_name: { id: 'bFieldTable', defaultMessage: 'Tabelle' },
      level: { id: 'bFieldLevel', defaultMessage: 'Ebene' },
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      field_label: { id: 'Fl3jPw', defaultMessage: 'Bezeichnung' },
      field_type_id: { id: 'LTiTmL', defaultMessage: 'Feld-Typ' },
      widget_type_id: { id: 'bFieldWidget', defaultMessage: 'Widget-Typ' },
      list_id: { id: '4+BE1s', defaultMessage: 'Liste' },
      preset: { id: 'Ps5mVn', defaultMessage: 'Standardwert' },
      obsolete: { id: 'Ob2kQz', defaultMessage: 'Obsolet' },
    },
  })

  const formatFieldValue = createHistoryFieldValueFormatter<FieldsHistory>({
    formatMessage,
    fieldValueMap: {
      obsolete: {
        booleanLabels: {
          trueLabel: { id: 'bCommonYes', defaultMessage: 'Ja' },
          falseLabel: { id: 'bCommonNo', defaultMessage: 'Nein' },
        },
      },
    },
  })

  return (
    <HistoryCompare<FieldsHistory>
      onBack={() => navigate({ to: fieldPath })}
      leftContent={
        <div className="form-container">
          <FieldForm
            onChange={onChange}
            validations={validations}
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        </div>
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'fields_history',
        rowIdField: 'field_id',
        rowId: fieldId,
        historyPath,
        routeHistoryId: fieldHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'fields',
        rowIdName: 'field_id',
        rowId: fieldId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
