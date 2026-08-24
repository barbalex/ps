import { useRef, useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { FaPlus } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'

import {
  createPlaceRole,
  createProjectUser,
  createSubprojectRole,
} from '../../modules/createRows.ts'

const {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Input,
  Tooltip,
} = fluentUiReactComponents

type Scope =
  | { kind: 'project'; projectId: string }
  | { kind: 'subproject'; projectId: string; subprojectId: string }
  | { kind: 'place'; projectId: string; placeId: string }

interface Props {
  scope: Scope
  /**
   * receives the created row id for the scope:
   * project_user_id (project) / subproject_role_id / place_role_id
   */
  onUserCreated: (createdId: string) => void
  disabled?: boolean
}

/**
 * Adds a person to the project directory by email and gives them a
 * 'read-all' role at the given scope. If the email is already in the
 * directory, only the missing role row is created.
 */
export const AddProjectUserButton = ({
  scope,
  onUserCreated,
  disabled = false,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const { formatMessage } = useIntl()
  const db = usePGlite()

  const onOpen = () => {
    setEmail('')
    setEmailError(null)
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
    setEmail('')
    setEmailError(null)
  }

  const onSave = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setEmailError(
        formatMessage({
          id: 'addUser.emailRequired',
          defaultMessage: 'Bitte eine E-Mail-Adresse eingeben.',
        }),
      )
      emailRef.current?.focus()
      return
    }

    const existing = await db.query<{ project_user_id: string }>(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 AND email = $2`,
      [scope.projectId, trimmedEmail],
    )
    const existingId = existing.rows[0]?.project_user_id

    let projectUserId: string
    let createdId: string
    if (existingId) {
      projectUserId = existingId
      createdId = existingId
    } else {
      projectUserId = await createProjectUser({
        projectId: scope.projectId,
        email: trimmedEmail,
      })
      if (!projectUserId) return
      createdId = projectUserId
    }

    // role row at the target scope (skip if one exists already)
    if (scope.kind === 'subproject') {
      const has = await db.query(
        `SELECT 1 FROM subproject_roles WHERE subproject_id = $1 AND project_user_id = $2`,
        [scope.subprojectId, projectUserId],
      )
      if (has.rows.length === 0) {
        createdId = (await createSubprojectRole({
          subprojectId: scope.subprojectId,
          projectUserId,
        }))!
      } else {
        const existing = await db.query<{ subproject_role_id: string }>(
          `SELECT subproject_role_id FROM subproject_roles WHERE subproject_id = $1 AND project_user_id = $2`,
          [scope.subprojectId, projectUserId],
        )
        createdId = existing.rows[0]!.subproject_role_id
      }
    }
    if (scope.kind === 'place') {
      const has = await db.query(
        `SELECT 1 FROM place_roles WHERE place_id = $1 AND project_user_id = $2`,
        [scope.placeId, projectUserId],
      )
      if (has.rows.length === 0) {
        createdId = (await createPlaceRole({
          placeId: scope.placeId,
          projectUserId,
        }))!
      } else {
        const existing = await db.query<{ place_role_id: string }>(
          `SELECT place_role_id FROM place_roles WHERE place_id = $1 AND project_user_id = $2`,
          [scope.placeId, projectUserId],
        )
        createdId = existing.rows[0]!.place_role_id
      }
    }

    setOpen(false)
    onUserCreated(createdId)
  }

  return (
    <>
      <Tooltip
        content={formatMessage({
          id: 'addUser.tooltip',
          defaultMessage: 'Neuen Benutzer erstellen',
        })}
        relationship="label"
      >
        <Button
          appearance="subtle"
          size="small"
          icon={<FaPlus />}
          onClick={onOpen}
          disabled={disabled}
        />
      </Tooltip>
      <Dialog
        open={open}
        onOpenChange={(_, data) => {
          if (!data.open) onClose()
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {formatMessage({
                id: 'addUser.title',
                defaultMessage: 'Neuen Benutzer erstellen',
              })}
            </DialogTitle>
            <DialogContent>
              <Field
                label={formatMessage({
                  id: 'addUser.emailLabel',
                  defaultMessage: 'E-Mail-Adresse',
                })}
                validationMessage={emailError ?? undefined}
                validationState={emailError ? 'error' : 'none'}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(null)
                  }}
                  ref={emailRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave()
                  }}
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={onSave}>
                {formatMessage({
                  id: 'addUser.saveBtn',
                  defaultMessage: 'Speichern',
                })}
              </Button>
              <Button appearance="secondary" onClick={onClose}>
                {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
