import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} = fluentUiReactComponents
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { authClient } from '../../../../modules/authClient.ts'

type Props = {
  open: boolean
  onClose: () => void
}

export const PasskeyDialog = ({ open, onClose }: Props) => {
  const intl = useIntl()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleClose = () => {
    if (isSubmitting) return
    setError('')
    setMessage('')
    onClose()
  }

  const handleAddPasskey = async () => {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const result = await authClient.passkey.addPasskey()

      const hasError =
        !!result?.error ||
        !!(
          result &&
          typeof result === 'object' &&
          'data' in result &&
          result.data &&
          typeof result.data === 'object' &&
          'error' in result.data &&
          result.data.error
        )

      if (hasError) {
        const msg =
          result?.error?.message ||
          intl.formatMessage({
            id: 'passkeyAddFailed',
            defaultMessage:
              'Passkey konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
          })
        setError(msg)
        return
      }

      setMessage(
        intl.formatMessage({
          id: 'passkeyAddSuccess',
          defaultMessage: 'Passkey erfolgreich hinzugefügt.',
        }),
      )
    } catch (err) {
      setError(
        intl.formatMessage({
          id: 'passkeyAddFailed',
          defaultMessage:
            'Passkey konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
        }),
      )
      console.error('Add passkey error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_e, data) => {
        if (!data.open) handleClose()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <FormattedMessage
              id="passkeyDialogTitle"
              defaultMessage="Passkey hinzufügen"
            />
          </DialogTitle>
          <DialogContent>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
              <FormattedMessage
                id="passkeyDialogDescription"
                defaultMessage="Passkeys ermöglichen eine sichere, passwortlose Anmeldung mit Fingerabdruck, Gesichtserkennung oder PIN."
              />
            </p>
            {error && (
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '0.875rem',
                  color: '#9f2f00',
                }}
              >
                {error}
              </p>
            )}
            {message && (
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '0.875rem',
                  color: '#1a6b1a',
                }}
              >
                {message}
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <FormattedMessage
                id="passkeyDialogClose"
                defaultMessage="Schliessen"
              />
            </Button>
            {!message && (
              <Button
                appearance="primary"
                onClick={handleAddPasskey}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <FormattedMessage
                    id="authPleaseWait"
                    defaultMessage="Bitte warten..."
                  />
                ) : (
                  <FormattedMessage
                    id="passkeyDialogAddBtn"
                    defaultMessage="Passkey registrieren"
                  />
                )}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
