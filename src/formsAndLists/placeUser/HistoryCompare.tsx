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

import type PlaceRoles from '../../models/public/PlaceRoles.ts'
import type PlaceRolesHistory from '../../models/public/PlaceRolesHistory.ts'

export const PlaceUserHistoryCompare = ({
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
  } = useParams({ strict: false })
  const placeUserPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/users/${placeUserId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/users/${placeUserId}`
  const historyPath = `${placeUserPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, { state: 'error'; message: string }>>({})

  const rowRes = useLiveQuery(`SELECT * FROM place_roles WHERE place_role_id = $1`, [
    placeUserId,
  ])
  const row = rowRes?.rows?.[0] as PlaceRoles | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || (row as unknown as Record<string, unknown>)[name] === value) return

    try {
      await db.query(
        `UPDATE place_roles SET ${name} = $1 WHERE place_role_id = $2`,
        [value, placeUserId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }

    setValidations((prev) => {
       
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'place_roles',
      rowIdName: 'place_role_id',
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
        name="project_user_id"
        table="project_users"
        value={row.project_user_id ?? ''}
        onChange={onChange}
        validationState={validations?.project_user_id?.state}
        validationMessage={validations?.project_user_id?.message}
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

  const visibleCurrentFields = new Set(['project_user_id', 'role'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      project_user_id: { id: 'qyI8KV', defaultMessage: 'Benutzer' },
      role: { id: 'Gj0HkM', defaultMessage: 'Rolle' },
    },
  })

  const formatFieldValue = (field: string, history: PlaceRolesHistory) =>
    stringifyHistoryValue((history as unknown as Record<string, unknown>)[field])

  return (
    <HistoryCompare<PlaceRolesHistory>
      onBack={() => navigate({ to: placeUserPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'place_roles_history',
        rowIdField: 'place_role_id',
        rowId: placeUserId,
        historyPath,
        routeHistoryId: placeUserHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'place_roles',
        rowIdName: 'place_role_id',
        rowId: placeUserId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
