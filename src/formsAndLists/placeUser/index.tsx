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
import type PlaceUsers from '../../models/public/PlaceUsers.ts'
import { userRoleOptions } from '../../modules/constants.ts'
import { AddUserButton } from '../../components/shared/AddUserButton.tsx'

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

export const PlaceUser = ({ from }) => {
  const { placeUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState({})
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_users WHERE place_user_id = $1`,
    [placeUserId],
  )
  const row: PlaceUsers | undefined = res?.rows?.[0]

  const ownerRes = useLiveQuery(
    `SELECT a.user_id FROM places pl JOIN subprojects sp ON pl.subproject_id = sp.subproject_id JOIN projects p ON sp.project_id = p.project_id JOIN accounts a ON p.account_id = a.account_id WHERE pl.place_id = $1`,
    [row?.place_id ?? null],
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
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'place_users',
      filters: [
        { function: 'eq', column: 'place_id', value: row.place_id },
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
        `UPDATE place_users SET role = $1 WHERE place_user_id = $2`,
        [value, placeUserId],
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
      table: 'place_users',
      filters: [
        { function: 'eq', column: 'place_id', value: row.place_id },
        { function: 'eq', column: 'user_id', value: row.user_id },
      ],
      operation: 'update',
      draft: { role: value },
      prev: { ...row },
    })
  }

  const onUserCreated = async (userId: string) => {
    try {
      await db.query(
        `UPDATE place_users SET user_id = $1 WHERE place_user_id = $2`,
        [userId, placeUserId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        user_id: { state: 'error', message: error.message },
      }))
      return
    }
    addOperation({
      table: 'place_users',
      rowIdName: 'place_user_id',
      rowId: placeUserId,
      operation: 'update',
      draft: { user_id: userId },
      prev: { ...row },
    })
    setTimeout(() => roleRef.current?.focus(), 50)
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'bCRvSw', defaultMessage: 'Ort-Benutzer' })}
        id={placeUserId}
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
        <DropdownField
          label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
          name="user_id"
          table="users"
          where={`user_id NOT IN (SELECT user_id FROM place_users WHERE place_id = '${row.place_id}' AND place_user_id != '${placeUserId}' AND user_id IS NOT NULL)`}
          value={row.user_id ?? ''}
          onChange={onChange}
          disabled={isOwner}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.user_id?.state}
          validationMessage={validations?.user_id?.message}
          button={
            <AddUserButton
              onUserCreated={onUserCreated}
              disabled={isOwner}
            />
          }
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
          ref={roleRef}
        />
      </div>
    </div>
  )
}