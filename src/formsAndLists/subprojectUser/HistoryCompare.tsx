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

import type SubprojectUsers from '../../models/public/SubprojectUsers.ts'
import type SubprojectUsersHistory from '../../models/public/SubprojectUsersHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId_/histories/$subprojectUserHistoryId'

export const SubprojectUserHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, subprojectUserId, subprojectUserHistoryId } =
    useParams({ from, strict: false })
  const subprojectUserPath = `/data/projects/${projectId}/subprojects/${subprojectId}/users/${subprojectUserId}`
  const historyPath = `${subprojectUserPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM subproject_roles WHERE subproject_role_id = $1`,
    [subprojectUserId],
  )
  const row = rowRes?.rows?.[0] as SubprojectUsers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_roles SET ${name} = $1 WHERE subproject_role_id = $2`,
        [value, subprojectUserId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }

    setValidations((prev) => {
       
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'subproject_roles',
      rowIdName: 'subproject_role_id',
      rowId: subprojectUserId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '1M9eWP', defaultMessage: 'Teilprojekt-Benutzer' })}
        id={subprojectUserId}
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

  const formatFieldValue = (field: string, history: SubprojectUsersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<SubprojectUsersHistory>
      onBack={() => navigate({ to: subprojectUserPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'subproject_roles_history',
        rowIdField: 'subproject_role_id',
        rowId: subprojectUserId,
        historyPath,
        routeHistoryId: subprojectUserHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'subproject_roles',
        rowIdName: 'subproject_role_id',
        rowId: subprojectUserId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
