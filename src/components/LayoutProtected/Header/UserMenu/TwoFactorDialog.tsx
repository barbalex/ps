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
  twoFactorEnabled: twoFactorEnabledLive,
  onChanged,
}: Props) => {
  const intl = useIntl()
  // the 2FA status as it was when the dialog opened. Confirming a code makes
  // the server issue a new session, the user menu refetches the status and
  // would already report "active" while this dialog still shows the setup
  // with its backup codes
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(twoFactorEnabledLive)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) setTwoFactorEnabled(twoFactorEnabledLive)
    wasOpen.current = open
  }, [open, twoFactorEnabledLive])
  const [password, setPassword] = useState('')
  const [enableMethod, setEnableMethod] = useState<TwoFactorMethod>('otp')
  const [totpUri, setTotpUri] = useState('')
  // the rendered image, kept together with the URI it was made from so that
  // a new secret never shows the previous code
  const [totpQrCode, setTotpQrCode] = useState<{
    uri: string
    dataUrl: string
  } | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  // the backup codes of a setup that still waits for its confirming code
  const pendingBackupCodesRef = useRef<string[]>([])
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const pendingChangedEnabledRef = useRef<boolean | null>(null)
  // an authenticator setup is only switched on after the user confirmed a
  // code from the app: until then the QR code and the code field stay up
  const awaitingTotpCode = !!totpUri && !message
  const totpQrCodeUrl = totpQrCode?.uri === totpUri ? totpQrCode.dataUrl : ''

  // Rendered in the browser: the URI carries the shared secret and must not
  // reach a third-party image service. The library is only loaded when
  // someone actually sets up an authenticator app.
  useEffect(() => {
    let isActive = true

    if (!totpUri) return

    import('qrcode')
      .then(({ toDataURL }) => toDataURL(totpUri, { width: 180, margin: 1 }))
      .then((dataUrl) => {
        if (isActive) setTotpQrCode({ uri: totpUri, dataUrl })
      })
      .catch((err) => {
        // the manual code below the image still allows the setup
        console.error('QR code generation failed:', err)
      })

    return () => {
      isActive = false
    }
  }, [totpUri])

  const handleClose = () => {
    if (isSubmitting || isVerifyingTotp) return
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
    setTotpQrCode(null)
    setTotpCode('')
    setBackupCodes([])
    pendingBackupCodesRef.current = []
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
        setTotpQrCode(null)
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
          result && typeof result === 'object' && 'data' in result ?
            (result.data as { totpURI?: string; backupCodes?: string[] })
          : undefined

        if (enableMethod === 'totp') {
          // 2FA is not active yet: it starts once the user confirmed a code
          // from the app (onVerifyTotp)
          pendingBackupCodesRef.current = resultData?.backupCodes ?? []
          setTotpCode('')
          setTotpUri(resultData?.totpURI || '')
          return
        }

        pendingChangedEnabledRef.current = true
        setTotpUri('')
        window.localStorage.setItem(TWO_FACTOR_PREFERRED_METHOD_KEY, 'otp')
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
      const fallback =
        twoFactorEnabled ?
          intl.formatMessage({
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

  const onVerifyTotp = async () => {
    const code = totpCode.trim()
    if (!code) return

    setError('')
    setIsVerifyingTotp(true)
    try {
      const result = await authClient.twoFactor.verifyTotp({ code })
      if (result.error) {
        const isInvalidCode =
          (result.error as { code?: string }).code === 'INVALID_CODE'
        setError(
          isInvalidCode ?
            intl.formatMessage({
              id: 'authTwoFactorAppVerifyFailed',
              defaultMessage: 'Authenticator-Code ungültig oder abgelaufen.',
            })
          : intl.formatMessage({
              id: 'twoFactorEnableFailed',
              defaultMessage:
                'Zwei-Faktor-Authentifizierung konnte nicht aktiviert werden.',
            }),
        )
        return
      }

      pendingChangedEnabledRef.current = true
      setBackupCodes(pendingBackupCodesRef.current)
      pendingBackupCodesRef.current = []
      setBackupCodesCopied(false)
      setTotpCode('')
      window.localStorage.setItem(TWO_FACTOR_PREFERRED_METHOD_KEY, 'totp')
      setMessage(
        intl.formatMessage({
          id: 'twoFactorEnabledTotpSuccess',
          defaultMessage:
            'Zwei-Faktor-Authentifizierung mit Authenticator-App ist aktiviert. Beim nächsten Login wird ein Code aus der App verlangt.',
        }),
      )
    } catch (err) {
      setError(
        intl.formatMessage({
          id: 'twoFactorEnableFailed',
          defaultMessage:
            'Zwei-Faktor-Authentifizierung konnte nicht aktiviert werden.',
        }),
      )
      console.error('Verify authenticator code error:', err)
    } finally {
      setIsVerifyingTotp(false)
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
                {twoFactorEnabled ?
                  <FormattedMessage
                    id="twoFactorDisableHelp"
                    defaultMessage="2FA ist derzeit aktiv. Du kannst es hier deaktivieren."
                  />
                : <FormattedMessage
                    id="twoFactorEnableHelp"
                    defaultMessage="2FA ist derzeit deaktiviert. Du kannst es hier aktivieren."
                  />
                }
              </p>

              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              {hasPassword && !message && !awaitingTotpCode && (
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

              {!twoFactorEnabled && !message && !awaitingTotpCode && (
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

              {awaitingTotpCode && (
                <div className={styles.totpSetup}>
                  <p className={styles.help}>
                    <FormattedMessage
                      id="twoFactorTotpSetupHelp"
                      defaultMessage="Scanne den QR-Code mit deiner Authenticator-App (z. B. Aegis, Google Authenticator, 1Password)."
                    />
                  </p>
                  {totpQrCodeUrl ?
                    <img
                      className={styles.qrCode}
                      src={totpQrCodeUrl}
                      alt={intl.formatMessage({
                        id: 'twoFactorTotpQrAlt',
                        defaultMessage: 'QR-Code für Authenticator-App',
                      })}
                    />
                  : <div
                      className={styles.qrCode}
                      aria-hidden="true"
                    />
                  }
                  <p className={styles.help}>
                    <FormattedMessage
                      id="twoFactorTotpManualCodeLabel"
                      defaultMessage="Manueller Code"
                    />
                    :
                  </p>
                  <Input
                    className={styles.fullWidth}
                    value={getManualCodeFromTotpUri(totpUri)}
                    readOnly
                  />
                  <p className={styles.help}>
                    <FormattedMessage
                      id="twoFactorTotpConfirmHelp"
                      defaultMessage="Gib danach den aktuellen Code aus der App ein, um die Einrichtung abzuschliessen."
                    />
                  </p>
                  <Input
                    className={styles.fullWidth}
                    value={totpCode}
                    onChange={(_event, data) => setTotpCode(data.value)}
                    placeholder={intl.formatMessage({
                      id: 'authTwoFactorAppCodePlaceholder',
                      defaultMessage: 'Code aus Authenticator-App eingeben',
                    })}
                    input={{
                      'aria-label': intl.formatMessage({
                        id: 'authTwoFactorAppCodePlaceholder',
                        defaultMessage: 'Code aus Authenticator-App eingeben',
                      }),
                      autoComplete: 'one-time-code',
                      inputMode: 'numeric',
                    }}
                    disabled={isVerifyingTotp}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        onVerifyTotp()
                      }
                    }}
                  />
                </div>
              )}

              {!twoFactorEnabled && backupCodes.length > 0 && (
                <div className={styles.backupCodesBox}>
                  <p className={styles.help}>
                    <FormattedMessage
                      id="twoFactorBackupCodesHelp"
                      defaultMessage="Speichere diese Backup-Codes sicher. Jeder Code kann nur einmal verwendet werden."
                    />
                  </p>
                  <div className={styles.backupCodesList}>
                    {backupCodes.map((code) => (
                      <code
                        key={code}
                        className={styles.backupCode}
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <Button
                    appearance="secondary"
                    onClick={copyBackupCodes}
                  >
                    <FormattedMessage
                      id="twoFactorBackupCodesCopyBtn"
                      defaultMessage="Backup-Codes kopieren"
                    />
                  </Button>
                  {backupCodesCopied && (
                    <p className={styles.help}>
                      <FormattedMessage
                        id="twoFactorBackupCodesCopied"
                        defaultMessage="Backup-Codes wurden in die Zwischenablage kopiert."
                      />
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
              disabled={isSubmitting || isVerifyingTotp}
            >
              <FormattedMessage
                id="logoutCancelBtn"
                defaultMessage="Abbrechen"
              />
            </Button>
            {awaitingTotpCode ?
              <Button
                appearance="primary"
                onClick={onVerifyTotp}
                disabled={isVerifyingTotp || !totpCode.trim()}
              >
                {isVerifyingTotp ?
                  <FormattedMessage
                    id="authPleaseWait"
                    defaultMessage="Bitte warten..."
                  />
                : <FormattedMessage
                    id="authTwoFactorVerifyBtn"
                    defaultMessage="2FA-Code prüfen"
                  />
                }
              </Button>
            : !message && (
                <Button
                  appearance="primary"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ?
                    <FormattedMessage
                      id="authPleaseWait"
                      defaultMessage="Bitte warten..."
                    />
                  : twoFactorEnabled ?
                    <FormattedMessage
                      id="twoFactorDisableBtn"
                      defaultMessage="2FA deaktivieren"
                    />
                  : <FormattedMessage
                      id="twoFactorEnableBtn"
                      defaultMessage="2FA aktivieren"
                    />
                  }
                </Button>
              )
            }
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
