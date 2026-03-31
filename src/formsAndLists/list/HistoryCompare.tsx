import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ListForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Lists from '../../models/public/Lists.ts'
import type ListsHistory from '../../models/public/ListsHistory.ts'

const from =
  '/data/projects/$projectId_/lists/$listId_/histories/$listHistoryId'

export const ListHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, listId, listHistoryId } = useParams({
    from,
    strict: false,
  })
  const listPath = `/data/projects/${projectId}/lists/${listId}/list`
  const historyPath = `/data/projects/${projectId}/lists/${listId}/histories`
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<
    Record<string, { state: string; message: string }>
  >({})

  const rowRes = useLiveQuery(`SELECT * FROM lists WHERE list_id = $1`, [
    listId,
  ])
  const row = rowRes?.rows?.[0] as Lists | undefined

  const visibleCurrentFields = new Set([
    'name',
    'value_type',
    'data',
    'obsolete',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      value_type: { id: 'lVr8Zn', defaultMessage: 'Wert-Typ' },
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
      obsolete: { id: 'Ob2kQz', defaultMessage: 'Obsolet' },
    },
  })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE lists SET ${name} = $1 WHERE list_id = $2`, [
        value,
        listId,
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
      table: 'lists',
      rowIdName: 'list_id',
      rowId: listId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
        id={listId}
      />
    )
  }

  return (
    <HistoryCompare<ListsHistory>
      onBack={() => navigate({ to: listPath })}
      leftContent={
        <ListForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
        />
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'lists_history',
        rowIdField: 'list_id',
        rowId: listId,
        historyPath,
        routeHistoryId: listHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'lists',
        rowIdName: 'list_id',
        rowId: listId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
