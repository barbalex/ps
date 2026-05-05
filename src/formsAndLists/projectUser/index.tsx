import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ProjectUsers from '../../models/public/ProjectUsers.ts'
import { userRoleOptions } from '../../modules/constants.ts'

import styles from './index.module.css'

import '../../form.css'

const {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} = fluentUiReactComponents

const from = '/data/projects/$projectId_/users/$projectUserId/'

export const ProjectUser = () => {
  const { projectUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM project_users WHERE project_user_id = $1`,
    [projectUserId],
  )
  const row: ProjectUsers | undefined = res?.rows?.[0]

  const ownerRes = useLiveQuery(
    `SELECT a.user_id FROM projects p JOIN accounts a ON p.account_id = a.account_id WHERE p.project_id = $1`,
    [row?.project_id ?? null],
  )
  const isOwner = !!(row?.user_id && ownerRes?.rows?.[0]?.user_id === row.user_id)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    if (
      name === 'role' &&
      (value === 'read-specific' || value === 'write-specific')
    ) {
      setPendingRole(value)
      return
    }

    try {
      await db.query(
        `UPDATE project_users SET ${name} = $1 WHERE project_user_id = $2`,
        [value, projectUserId],
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
      table: 'project_users',
      filters: [
        { function: 'eq', column: 'project_id', value: row.project_id },
        { function: 'eq', column: 'user_id', value: row.user_id },
      ],
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onConfirmRole = async () => {
    const value = pendingRole!
    setPendingRole(null)
    try {
      await db.query(
        `UPDATE project_users SET role = $1 WHERE project_user_id = $2`,
        [value, projectUserId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        role: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role: _, ...rest } = prev
      return rest
    })
    if (!row.user_id) return
    addOperation({
      table: 'project_users',
      filters: [
        { function: 'eq', column: 'project_id', value: row.project_id },
        { function: 'eq', column: 'user_id', value: row.user_id },
      ],
      operation: 'update',
      draft: { role: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'gi+ubY',
          defaultMessage: 'Projekt-Benutzer',
        })}
        id={projectUserId}
      />
    )
  }

  const showSpecificNotice =
    row.role === 'read-specific' || row.role === 'write-specific'

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {isOwner && (
          <p className={styles.ownerNotice}>
            {formatMessage({
              id: 'ownerRoleNotEditable',
              defaultMessage:
                'Diese Rolle wird automatisch gesetzt und kann nicht bearbeitet werden.',
            })}
          </p>
        )}
        {showSpecificNotice && (
          <p className={styles.specificRoleNotice}>
            {formatMessage({
              id: 'specificRoleNotice',
              defaultMessage:
                'Eine spezifische Rolle wurde gesetzt. Alle untergeordneten Rollen (falls vorhanden) wurden entfernt und müssen manuell gesetzt werden.',
            })}
          </p>
        )}
        <Dialog
          open={pendingRole !== null}
          onOpenChange={(_, data) => {
            if (!data.open) setPendingRole(null)
          }}
        >
          <DialogSurface>
            <DialogBody>
              <DialogTitle>
                {formatMessage({
                  id: 'specificRoleConfirmTitle',
                  defaultMessage: 'Spezifische Rolle setzen?',
                })}
              </DialogTitle>
              <DialogContent>
                {formatMessage({
                  id: 'specificRoleConfirmContent',
                  defaultMessage:
                    'Durch das Setzen einer spezifischen Rolle werden alle untergeordneten Rollen (falls vorhanden) für diesen Benutzer entfernt. Diese müssen danach manuell gesetzt werden.',
                })}
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" onClick={onConfirmRole}>
                  {formatMessage({
                    id: 'specificRoleConfirmBtn',
                    defaultMessage: 'Rolle setzen',
                  })}
                </Button>
                <Button
                  appearance="secondary"
                  onClick={() => setPendingRole(null)}
                >
                  {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
        <DropdownField
          label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
          name="user_id"
          table="users"
          where={`user_id NOT IN (SELECT user_id FROM project_users WHERE project_id = '${row.project_id}' AND project_user_id != '${projectUserId}' AND user_id IS NOT NULL)`}
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
          disabled={isOwner || !row.user_id}
          validationState={validations?.role?.state}
          validationMessage={validations?.role?.message}
        />
      </div>
    </div>
  )
}