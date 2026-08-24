import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
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
  Field,
  Input,
} = fluentUiReactComponents

const from = '/data/projects/$projectId_/users/$projectUserId/'

type Row = {
  project_user_id: string
  project_id: string | null
  email: string | null
  role: string | null
  project_role_id: string | null
  [key: string]: unknown
}

export const ProjectUser = () => {
  const { projectUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT pu.*, pr.role, pr.project_role_id
     FROM project_users pu
     LEFT JOIN project_roles pr ON pr.project_user_id = pu.project_user_id
     WHERE pu.project_user_id = $1`,
    [projectUserId],
  )
  const row: Row | undefined = res?.rows?.[0]

  // the owner row is created by trigger and must not be edited
  const isOwner = row?.role === 'own'

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

    // email edits write the directory; role edits write project_roles
    const table = name === 'role' ? 'project_roles' : 'project_users'
    const rowIdName = name === 'role' ? 'project_role_id' : 'project_user_id'
    const rowId = name === 'role' ? row.project_role_id : projectUserId
    if (!rowId) return

    try {
      await db.query(
        `UPDATE ${table} SET ${name} = $1 WHERE ${rowIdName} = $2`,
        [value, rowId],
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
      table,
      rowIdName,
      rowId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onConfirmRole = async () => {
    const value = pendingRole!
    setPendingRole(null)
    if (!row.project_role_id) return
    try {
      await db.query(
        `UPDATE project_roles SET role = $1 WHERE project_role_id = $2`,
        [value, row.project_role_id],
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
    addOperation({
      table: 'project_roles',
      rowIdName: 'project_role_id',
      rowId: row.project_role_id,
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
          defaultMessage: 'Projektbenutzer',
        })}
        id={projectUserId}
      />
    )
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
        <Field
          label={formatMessage({
            id: 'addUser.emailLabel',
            defaultMessage: 'E-Mail-Adresse',
          })}
          validationState={validations?.email?.state ? 'error' : undefined}
          validationMessage={validations?.email?.message}
        >
          <Input
            name="email"
            value={row.email ?? ''}
            onChange={onChange}
            disabled={isOwner}
            autoFocus
            ref={autoFocusRef}
          />
        </Field>
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
          ref={roleRef}
        />
      </div>
    </div>
  )
}
