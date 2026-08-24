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
import type SubprojectRoles from '../../models/public/SubprojectRoles.ts'
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

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'

type Row = SubprojectRoles & { email: string | null; project_id: string | null }

export const SubprojectUser = () => {
  const { subprojectUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState({})
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT sr.*, pu.email, sp.project_id
     FROM subproject_roles sr
     JOIN project_users pu ON pu.project_user_id = sr.project_user_id
     JOIN subprojects sp ON sp.subproject_id = sr.subproject_id
     WHERE sr.subproject_role_id = $1`,
    [subprojectUserId],
  )
  const row: Row | undefined = res?.rows?.[0]

  // the project owner's own directory row: its role is maintained by triggers
  const ownerRes = useLiveQuery(
    `SELECT 1 FROM project_roles WHERE project_user_id = $1 AND role = 'own'`,
    [row?.project_user_id ?? null],
  )
  const isOwner = (ownerRes?.rows?.length ?? 0) > 0

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
      const { [name]: _, ...rest } = prev
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

  const onConfirmRole = async () => {
    const value = pendingRole!
    setPendingRole(null)
    try {
      await db.query(
        `UPDATE subproject_roles SET role = $1 WHERE subproject_role_id = $2`,
        [value, subprojectUserId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        role: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      const { role: _, ...rest } = prev
      return rest
    })
    if (!row.project_user_id) return
    addOperation({
      table: 'subproject_roles',
      rowIdName: 'subproject_role_id',
      rowId: subprojectUserId,
      operation: 'update',
      draft: { role: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="User" id={subprojectUserId} />
  }

  const showSpecificNotice =
    row.role === 'read-specific' || row.role === 'write-specific'

  const pendingRoleOption = userRoleOptions.find(
    (o) => o.value === pendingRole,
  )
  const pendingRoleLabel = pendingRoleOption
    ? formatMessage({
        id: pendingRoleOption.labelId,
        defaultMessage: pendingRoleOption.defaultMessage,
      })
    : pendingRole ?? ''

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
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
                {formatMessage(
                  {
                    id: 'specificRoleConfirmTitle',
                    defaultMessage: 'Rolle „{role}“ setzen?',
                  },
                  { role: pendingRoleLabel },
                )}
              </DialogTitle>
              <DialogContent>
                {formatMessage(
                  {
                    id: 'specificRoleConfirmContent',
                    defaultMessage:
                      'Durch das Setzen der Rolle „{role}“ werden alle untergeordneten Rollen (falls vorhanden) für diesen Benutzer entfernt. Diese müssen danach manuell gesetzt werden.',
                  },
                  { role: pendingRoleLabel },
                )}
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
                  {formatMessage({
                    id: 'cancel',
                    defaultMessage: 'Abbrechen',
                  })}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
        <DropdownField
          label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
          name="project_user_id"
          table="project_users"
          where={`project_id = '${row.project_id}' AND project_user_id NOT IN (SELECT project_user_id FROM subproject_roles WHERE subproject_id = '${row.subproject_id}' AND subproject_role_id != '${subprojectUserId}')`}
          value={row.project_user_id ?? ''}
          onChange={onChange}
          disabled={isOwner}
          autoFocus
          ref={autoFocusRef}
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
              formatMessage({
                id: o.labelId,
                defaultMessage: o.defaultMessage,
              }),
            ]),
          )}
          value={row.role ?? ''}
          onChange={onChange}
          disabled={isOwner || !row.project_user_id}
          validationState={validations?.role?.state}
          validationMessage={validations?.role?.message}
          ref={roleRef}
        />
      </div>
    </div>
  )
}
