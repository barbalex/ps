import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  Radio,
  RadioGroup,
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

type TwoFactorMethod = 'otp' | 'totp'

const TWO_FACTOR_PREFERRED_METHOD_KEY = 'twoFactorPreferredMethod'

const getManualCodeFromTotpUri = (totpUri: string) => {
  try {
    const parsed = new URL(totpUri)
    return parsed.searchParams.get('secret') || ''
  } catch {
    return ''
  }
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
  const [enableMethod, setEnableMethod] = useState<TwoFactorMethod>('otp')
  const [totpUri, setTotpUri] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const pendingChangedEnabledRef = useRef<boolean | null>(null)

  const handleClose = () => {
    if (isSubmitting) return
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = undefined
    }
    onClose()
    if (pendingChangedEnabledRef.current !== null) {
      onChanged(pendingChangedEnabledRef.current)
      pendingChangedEnabledRef.current = null
    }
  }

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      pendingChangedEnabledRef.current = null
    },
    [],
  )

  useEffect(() => {
    if (open) return
    setPassword('')
    setEnableMethod('otp')
    setTotpUri('')
    setBackupCodes([])
    setBackupCodesCopied(false)
    setError('')
    setMessage('')
  }, [open])

  const copyBackupCodes = async () => {
    if (!backupCodes.length) return

    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      setBackupCodesCopied(true)
    } catch {
      setError(
        intl.formatMessage({
          id: 'twoFactorBackupCodesCopyFailed',
          defaultMessage: 'Backup-Codes konnten nicht kopiert werden.',
        }),
      )
    }
  }

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
        pendingChangedEnabledRef.current = false
        window.localStorage.removeItem(TWO_FACTOR_PREFERRED_METHOD_KEY)
        setTotpUri('')
        setBackupCodes([])
        setBackupCodesCopied(false)
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

        const resultData =
          result && typeof result === 'object' && 'data' in result
            ? (result.data as { totpURI?: string; backupCodes?: string[] })
            : undefined

        setBackupCodes(resultData?.backupCodes ?? [])
        setBackupCodesCopied(false)

        pendingChangedEnabledRef.current = true

        if (enableMethod === 'totp') {
          const uri = resultData?.totpURI || ''
          setTotpUri(uri)
          window.localStorage.setItem(TWO_FACTOR_PREFERRED_METHOD_KEY, 'totp')
          setMessage(
            intl.formatMessage({
              id: 'twoFactorEnabledTotpSuccess',
              defaultMessage:
                '2FA mit Authenticator-App ist aktiviert. Scanne den QR-Code und verwende danach App-Codes beim Login.',
            }),
          )
          return
        }

        window.localStorage.setItem(TWO_FACTOR_PREFERRED_METHOD_KEY, 'otp')
        setTotpUri('')
        setMessage(
          intl.formatMessage({
            id: 'twoFactorEnabledSuccess',
            defaultMessage:
              'Zwei-Faktor-Authentifizierung aktiviert. Beim nächsten Login wird ein Code per E-Mail verlangt.',
          }),
        )
      }

      const shouldAutoClose = twoFactorEnabled
      if (shouldAutoClose) {
        closeTimeoutRef.current = setTimeout(() => {
          handleClose()
          closeTimeoutRef.current = undefined
        }, 1400)
      }
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
        if (!data.open) handleClose()
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
                    defaultMessage="2FA ist derzeit aktiv. Du kannst es hier deaktivieren."
                  />
                ) : (
                  <FormattedMessage
                    id="twoFactorEnableHelp"
                    defaultMessage="2FA ist derzeit deaktiviert. Du kannst es hier aktivieren."
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

              {!twoFactorEnabled && !message && (
                <RadioGroup
                  value={enableMethod}
                  onChange={(_event, data) =>
                    setEnableMethod(data.value as TwoFactorMethod)
                  }
                >
                  <Radio
                    value="otp"
                    label={intl.formatMessage({
                      id: 'twoFactorMethodEmailLabel',
                      defaultMessage: 'E-Mail-Code verwenden',
                    })}
                  />
                  <Radio
                    value="totp"
                    label={intl.formatMessage({
                      id: 'twoFactorMethodAppLabel',
                      defaultMessage: 'Authenticator-App verwenden',
                    })}
                  />
                </RadioGroup>
              )}

              {totpUri && (
                <div className={styles.totpSetup}>
                  <p className={styles.help}>
                    {intl.formatMessage({
                      id: 'twoFactorTotpSetupHelp',
                      defaultMessage:
                        'Scanne den QR-Code mit deiner Authenticator-App (z. B. Aegis, Google Authenticator, 1Password).',
                    })}
                  </p>
                  <img
                    className={styles.qrCode}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpUri)}`}
                    alt={intl.formatMessage({
                      id: 'twoFactorTotpQrAlt',
                      defaultMessage: 'QR-Code für Authenticator-App',
                    })}
                  />
                  <p className={styles.help}>
                    {intl.formatMessage({
                      id: 'twoFactorTotpManualCodeLabel',
                      defaultMessage: 'Manueller Code',
                    })}
                    :
                  </p>
                  <Input value={getManualCodeFromTotpUri(totpUri)} readOnly />
                </div>
              )}

              {!twoFactorEnabled && backupCodes.length > 0 && (
                <div className={styles.backupCodesBox}>
                  <p className={styles.help}>
                    {intl.formatMessage({
                      id: 'twoFactorBackupCodesHelp',
                      defaultMessage:
                        'Speichere diese Backup-Codes sicher. Jeder Code kann nur einmal verwendet werden.',
                    })}
                  </p>
                  <div className={styles.backupCodesList}>
                    {backupCodes.map((code) => (
                      <code key={code} className={styles.backupCode}>
                        {code}
                      </code>
                    ))}
                  </div>
                  <Button appearance="secondary" onClick={copyBackupCodes}>
                    <FormattedMessage
                      id="twoFactorBackupCodesCopyBtn"
                      defaultMessage="Backup-Codes kopieren"
                    />
                  </Button>
                  {backupCodesCopied && (
                    <p className={styles.help}>
                      {intl.formatMessage({
                        id: 'twoFactorBackupCodesCopied',
                        defaultMessage:
                          'Backup-Codes wurden in die Zwischenablage kopiert.',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <FormattedMessage
                id="logoutCancelBtn"
                defaultMessage="Abbrechen"
              />
            </Button>
            {!message && (
              <Button
                appearance="primary"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <FormattedMessage
                    id="authPleaseWait"
                    defaultMessage="Bitte warten..."
                  />
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
