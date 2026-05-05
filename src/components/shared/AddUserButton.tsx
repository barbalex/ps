import { useRef, useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { FaPlus } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom } from '../../store.ts'

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

interface Props {
  onUserCreated: (userId: string) => void
  disabled?: boolean
}

export const AddUserButton = ({ onUserCreated, disabled = false }: Props) => {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

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
    const trimmedEmail = email.trim()
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

    const existing = await db.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [trimmedEmail],
    )
    if (existing.rows.length > 0) {
      setEmail('')
      setEmailError(
        formatMessage({
          id: 'addUser.emailExists',
          defaultMessage:
            'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.',
        }),
      )
      emailRef.current?.focus()
      return
    }

    const user_id = uuidv7()
    await db.query(`INSERT INTO users (user_id, email) VALUES ($1, $2)`, [
      user_id,
      trimmedEmail,
    ])
    addOperation({
      table: 'users',
      operation: 'insert',
      draft: { user_id, email: trimmedEmail },
    })
    setOpen(false)
    onUserCreated(user_id)
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
