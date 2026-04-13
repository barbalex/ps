import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
} = fluentUiReactComponents
import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { authClient } from '../../../../modules/authClient.ts'
import styles from './TwoFactorDialog.module.css'

type Props = {
  open: boolean
  onClose: () => void
  hasPassword: boolean
  twoFactorEnabled: boolean
  onChanged: (enabled: boolean) => void
}

export const TwoFactorDialog = ({
  open,
  onClose,
  hasPassword,
  twoFactorEnabled,
  onChanged,
}: Props) => {
  const intl = useIntl()
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (open) return
    setPassword('')
    setError('')
    setMessage('')
  }, [open])

  const onSubmit = async () => {
    setError('')
    setMessage('')

    if (hasPassword && !password.trim()) {
      setError(
        intl.formatMessage({
          id: 'twoFactorPasswordRequired',
          defaultMessage: 'Bitte Passwort eingeben.',
        }),
      )
      return
    }

    setIsSubmitting(true)
    try {
      const payload = hasPassword ? { password: password.trim() } : {}

      if (twoFactorEnabled) {
        const result = await authClient.twoFactor.disable(payload)
        if (result.error) {
          throw new Error(result.error.message || 'disable two-factor failed')
        }
        onChanged(false)
        setMessage(
          intl.formatMessage({
            id: 'twoFactorDisabledSuccess',
            defaultMessage: 'Zwei-Faktor-Authentifizierung deaktiviert.',
          }),
        )
      } else {
        const result = await authClient.twoFactor.enable(payload)
        if (result.error) {
          throw new Error(result.error.message || 'enable two-factor failed')
        }
        onChanged(true)
        setMessage(
          intl.formatMessage({
            id: 'twoFactorEnabledSuccess',
            defaultMessage:
              'Zwei-Faktor-Authentifizierung aktiviert. Beim nächsten Login wird ein Code per E-Mail verlangt.',
          }),
        )
      }

      closeTimeoutRef.current = setTimeout(() => {
        onClose()
        closeTimeoutRef.current = undefined
      }, 1400)
    } catch (err) {
      const fallback = twoFactorEnabled
        ? intl.formatMessage({
            id: 'twoFactorDisableFailed',
            defaultMessage:
              'Zwei-Faktor-Authentifizierung konnte nicht deaktiviert werden.',
          })
        : intl.formatMessage({
            id: 'twoFactorEnableFailed',
            defaultMessage:
              'Zwei-Faktor-Authentifizierung konnte nicht aktiviert werden.',
          })

      setError(err instanceof Error ? err.message || fallback : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_event, data) => {
        if (!data.open && !isSubmitting) onClose()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <FormattedMessage
              id="twoFactorDialogTitle"
              defaultMessage="Zwei-Faktor-Authentifizierung"
            />
          </DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <p className={styles.help}>
                {twoFactorEnabled ? (
                  <FormattedMessage
                    id="twoFactorDisableHelp"
                    defaultMessage="2FA ist derzeit aktiv. Sie können es hier deaktivieren."
                  />
                ) : (
                  <FormattedMessage
                    id="twoFactorEnableHelp"
                    defaultMessage="2FA ist derzeit deaktiviert. Aktivieren Sie es für zusätzliche Sicherheit."
                  />
                )}
              </p>

              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              {hasPassword && !message && (
                <Input
                  type="password"
                  value={password}
                  onChange={(_event, data) => setPassword(data.value)}
                  placeholder={intl.formatMessage({
                    id: 'authPasswordLabel',
                    defaultMessage: 'Passwort',
                  })}
                  disabled={isSubmitting}
                />
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <FormattedMessage id="logoutCancelBtn" defaultMessage="Abbrechen" />
            </Button>
            {!message && (
              <Button appearance="primary" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <FormattedMessage id="authPleaseWait" defaultMessage="Bitte warten..." />
                ) : twoFactorEnabled ? (
                  <FormattedMessage
                    id="twoFactorDisableBtn"
                    defaultMessage="2FA deaktivieren"
                  />
                ) : (
                  <FormattedMessage
                    id="twoFactorEnableBtn"
                    defaultMessage="2FA aktivieren"
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
