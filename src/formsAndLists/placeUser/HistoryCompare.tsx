import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { stringifyHistoryValue } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { userRoleOptions } from '../../modules/constants.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type PlaceUsers from '../../models/public/PlaceUsers.ts'
import type PlaceUsersHistory from '../../models/public/PlaceUsersHistory.ts'

export const PlaceUserHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId_/histories/$placeUserHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/histories/$placeUserHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeUserId,
    placeUserHistoryId,
  } = useParams({ from, strict: false })
  const placeUserPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/users/${placeUserId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/users/${placeUserId}`
  const historyPath = `${placeUserPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM place_users WHERE place_user_id = $1`, [
    placeUserId,
  ])
  const row = rowRes?.rows?.[0] as PlaceUsers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE place_users SET ${name} = $1 WHERE place_user_id = $2`,
        [value, placeUserId],
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
      table: 'place_users',
      rowIdName: 'place_user_id',
      rowId: placeUserId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'bCRvSw', defaultMessage: 'Ort-Benutzer' })}
        id={placeUserId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <>
      <DropdownField
        label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
        name="user_id"
        table="users"
        value={row.user_id ?? ''}
        onChange={onChange}
        validationState={validations?.user_id?.state}
        validationMessage={validations?.user_id?.message}
      />
      <RadioGroupField
        label={formatMessage({ id: 'Gj0HkM', defaultMessage: 'Rolle' })}
        name="role"
        list={userRoleOptions.map((o) => o.value)}
        labelMap={Object.fromEntries(
          userRoleOptions.map((o) => [
            o.value,
            formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
          ]),
        )}
        value={row.role ?? ''}
        onChange={onChange}
        validationState={validations?.role?.state}
        validationMessage={validations?.role?.message}
      />
      </>
    </div>
  )

  const visibleCurrentFields = new Set(['user_id', 'role'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      user_id: { id: 'qyI8KV', defaultMessage: 'Benutzer' },
      role: { id: 'Gj0HkM', defaultMessage: 'Rolle' },
    },
  })

  const formatFieldValue = (field: string, history: PlaceUsersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<PlaceUsersHistory>
      onBack={() => navigate({ to: placeUserPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'place_users_history',
        rowIdField: 'place_user_id',
        rowId: placeUserId,
        historyPath,
        routeHistoryId: placeUserHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'place_users',
        rowIdName: 'place_user_id',
        rowId: placeUserId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
