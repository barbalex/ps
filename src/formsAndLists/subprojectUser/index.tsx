import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type SubprojectUsers from '../../models/public/SubprojectUsers.ts'
import { userRoleOptions } from '../../modules/constants.ts'

import styles from './index.module.css'

import '../../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'

export const SubprojectUser = () => {
  const { subprojectUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM subproject_users WHERE subproject_user_id = $1`,
    [subprojectUserId],
  )
  const row: SubprojectUsers | undefined = res?.rows?.[0]

  const ownerRes = useLiveQuery(
    `SELECT a.user_id FROM subprojects sp JOIN projects p ON sp.project_id = p.project_id JOIN accounts a ON p.account_id = a.account_id WHERE sp.subproject_id = $1`,
    [row?.subproject_id ?? null],
  )
  const isOwner = !!(row?.user_id && ownerRes?.rows?.[0]?.user_id === row.user_id)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_users SET ${name} = $1 WHERE subproject_user_id = $2`,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'subproject_users',
      filters: [
        { function: 'eq', column: 'subproject_id', value: row.subproject_id },
        { function: 'eq', column: 'user_id', value: row.user_id },
      ],
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <>
            {isOwner && (
              <p className={styles.ownerNotice}>
                {formatMessage({
                  id: 'ownerRoleNotEditable',
                  defaultMessage:
                    'Diese Rolle wird automatisch gesetzt und kann nicht bearbeitet werden.',
                })}
              </p>
            )}
            <DropdownField
              label={formatMessage({
                id: 'qyI8KV',
                defaultMessage: 'Benutzer',
              })}
              name="user_id"
              table="users"
              where={`user_id NOT IN (SELECT user_id FROM subproject_users WHERE subproject_id = '${row.subproject_id}' AND subproject_user_id != '${subprojectUserId}' AND user_id IS NOT NULL)`}
              value={row.user_id ?? ''}
              onChange={onChange}
              disabled={isOwner}
              autoFocus
              ref={autoFocusRef}
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
                  formatMessage({
                    id: o.labelId,
                    defaultMessage: o.defaultMessage,
                  }),
                ]),
              )}
              value={row.role ?? ''}
              onChange={onChange}
              disabled={isOwner}
              validationState={validations?.role?.state}
              validationMessage={validations?.role?.message}
            />
          </>
        ) : (
          <NotFound table="User" id={subprojectUserId} />
        )}
      </div>
    </div>
  )
}
