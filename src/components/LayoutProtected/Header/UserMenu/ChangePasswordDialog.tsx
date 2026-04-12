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
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import styles from './ChangePasswordDialog.module.css'
import { authClient } from '../../../../modules/authClient.ts'

type Props = {
  open: boolean
  onClose: () => void
  hasPassword?: boolean
}

export const ChangePasswordDialog = ({ open, onClose, hasPassword = true }: Props) => {
  const intl = useIntl()
  const showPasswordLabel = intl.formatMessage({
    id: 'changePasswordShowPassword',
    defaultMessage: 'Passwort anzeigen',
  })
  const hidePasswordLabel = intl.formatMessage({
    id: 'changePasswordHidePassword',
    defaultMessage: 'Passwort verbergen',
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordMessage, setChangePasswordMessage] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [changePasswordVisibility, setChangePasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  })
  const changePasswordSuccessTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const changePasswordResetTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  const resetDialogState = () => {
    setChangePasswordError('')
    setChangePasswordMessage('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setChangePasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    })
  }

  const handleClose = () => {
    if (isChangingPassword) return
    if (changePasswordSuccessTimeoutRef.current) {
      clearTimeout(changePasswordSuccessTimeoutRef.current)
      changePasswordSuccessTimeoutRef.current = undefined
    }
    onClose()
  }

  const onSubmitChangePassword = async () => {
    setChangePasswordError('')
    setChangePasswordMessage('')

    if (hasPassword && !currentPassword) {
      setChangePasswordError(
        intl.formatMessage({
          id: 'changePasswordAllFieldsRequired',
          defaultMessage: 'Bitte alle Passwortfelder ausfüllen.',
        }),
      )
      return
    }

    if (!newPassword || !confirmNewPassword) {
      setChangePasswordError(
        intl.formatMessage({
          id: 'changePasswordAllFieldsRequired',
          defaultMessage: 'Bitte alle Passwortfelder ausfüllen.',
        }),
      )
      return
    }

    if (newPassword.length < 8) {
      setChangePasswordError(
        intl.formatMessage({
          id: 'changePasswordTooShort',
          defaultMessage: 'Das neue Passwort muss mindestens 8 Zeichen haben.',
        }),
      )
      return
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError(
        intl.formatMessage({
          id: 'changePasswordMismatch',
          defaultMessage: 'Die neuen Passwörter stimmen nicht überein.',
        }),
      )
      return
    }

    setIsChangingPassword(true)
    try {
      const result = await authClient.changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        setChangePasswordError(
          result.error.message ||
            intl.formatMessage({
              id: 'changePasswordFailed',
              defaultMessage: hasPassword ? 'Passwort konnte nicht geändert werden.' : 'Passwort konnte nicht gesetzt werden.',
            }),
        )
        return
      }

      setChangePasswordMessage(
        intl.formatMessage({
          id: 'changePasswordSuccess',
          defaultMessage: hasPassword ? 'Passwort erfolgreich geändert.' : 'Passwort erfolgreich gesetzt.',
        }),
      )
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      changePasswordSuccessTimeoutRef.current = setTimeout(() => {
        onClose()
        changePasswordSuccessTimeoutRef.current = undefined
      }, 2000)
    } catch (error) {
      setChangePasswordError(
        intl.formatMessage({
          id: 'changePasswordFailed',
          defaultMessage: hasPassword ? 'Passwort konnte nicht geändert werden.' : 'Passwort konnte nicht gesetzt werden.',
        }),
      )
      console.error('Change password error:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const toggleChangePasswordVisibility = (
    field: 'currentPassword' | 'newPassword' | 'confirmNewPassword',
  ) => {
    setChangePasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  useEffect(
    () => () => {
      if (changePasswordSuccessTimeoutRef.current) {
        clearTimeout(changePasswordSuccessTimeoutRef.current)
      }
      if (changePasswordResetTimeoutRef.current) {
        clearTimeout(changePasswordResetTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (open) {
      if (changePasswordResetTimeoutRef.current) {
        clearTimeout(changePasswordResetTimeoutRef.current)
        changePasswordResetTimeoutRef.current = undefined
      }
      return
    }

    changePasswordResetTimeoutRef.current = setTimeout(() => {
      resetDialogState()
      changePasswordResetTimeoutRef.current = undefined
    }, 150)

    return () => {
      if (changePasswordResetTimeoutRef.current) {
        clearTimeout(changePasswordResetTimeoutRef.current)
        changePasswordResetTimeoutRef.current = undefined
      }
    }
  }, [open])

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
            {hasPassword ? (
              <FormattedMessage
                id="changePasswordDialogTitle"
                defaultMessage="Passwort ändern"
              />
            ) : (
              <FormattedMessage
                id="setPasswordDialogTitle"
                defaultMessage="Passwort setzen"
              />
            )}
          </DialogTitle>
          <DialogContent>
            <div className={styles.changePasswordForm}>
              {!hasPassword && (
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  <FormattedMessage
                    id="setPasswordDialogDescription"
                    defaultMessage="Diese Funktion ermöglicht es dir, dich zusätzlich mit deiner E-Mail-Adresse und einem Passwort anzumelden, ohne dich auf Google verlassen zu müssen."
                  />
                </div>
              )}
              {changePasswordError && (
                <div className={styles.changePasswordError}>
                  {changePasswordError}
                </div>
              )}
              {changePasswordMessage && (
                <div className={styles.changePasswordSuccess}>
                  {changePasswordMessage}
                </div>
              )}

              {!changePasswordMessage && (
                <>
                  {hasPassword && (
                    <div className={styles.passwordInputWrapper}>
                      <Input
                        type={
                          changePasswordVisibility.currentPassword
                            ? 'text'
                            : 'password'
                        }
                        value={currentPassword}
                        onChange={(_event, data) =>
                          setCurrentPassword(data.value)
                        }
                        placeholder={intl.formatMessage({
                          id: 'changePasswordCurrentPassword',
                          defaultMessage: 'Aktuelles Passwort',
                        })}
                        disabled={isChangingPassword}
                        className={styles.passwordInputField}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() =>
                          toggleChangePasswordVisibility('currentPassword')
                        }
                        aria-label={
                          changePasswordVisibility.currentPassword
                            ? hidePasswordLabel
                            : showPasswordLabel
                        }
                        title={
                          changePasswordVisibility.currentPassword
                            ? hidePasswordLabel
                            : showPasswordLabel
                        }
                        disabled={isChangingPassword}
                      >
                        {changePasswordVisibility.currentPassword ? (
                          <MdVisibilityOff />
                        ) : (
                          <MdVisibility />
                        )}
                      </button>
                    </div>
                  )}
                  <div className={styles.passwordInputWrapper}>
                    <Input
                      type={
                        changePasswordVisibility.newPassword
                          ? 'text'
                          : 'password'
                      }
                      value={newPassword}
                      onChange={(_event, data) => setNewPassword(data.value)}
                      placeholder={intl.formatMessage({
                        id: 'changePasswordNewPassword',
                        defaultMessage: 'Neues Passwort',
                      })}
                      disabled={isChangingPassword}
                      className={styles.passwordInputField}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => toggleChangePasswordVisibility('newPassword')}
                      aria-label={
                        changePasswordVisibility.newPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      title={
                        changePasswordVisibility.newPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      disabled={isChangingPassword}
                    >
                      {changePasswordVisibility.newPassword ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </button>
                  </div>
                  <div className={styles.passwordInputWrapper}>
                    <Input
                      type={
                        changePasswordVisibility.confirmNewPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmNewPassword}
                      onChange={(_event, data) =>
                        setConfirmNewPassword(data.value)
                      }
                      placeholder={intl.formatMessage({
                        id: 'changePasswordConfirmNewPassword',
                        defaultMessage: 'Neues Passwort bestätigen',
                      })}
                      disabled={isChangingPassword}
                      className={styles.passwordInputField}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        toggleChangePasswordVisibility('confirmNewPassword')
                      }
                      aria-label={
                        changePasswordVisibility.confirmNewPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      title={
                        changePasswordVisibility.confirmNewPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      disabled={isChangingPassword}
                    >
                      {changePasswordVisibility.confirmNewPassword ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            {!changePasswordMessage && (
              <>
                <Button
                  appearance="secondary"
                  onClick={handleClose}
                  disabled={isChangingPassword}
                >
                  <FormattedMessage
                    id="changePasswordCancelBtn"
                    defaultMessage="Abbrechen"
                  />
                </Button>
                <Button
                  appearance="primary"
                  onClick={onSubmitChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <FormattedMessage
                      id="changePasswordPleaseWait"
                      defaultMessage="Bitte warten..."
                    />
                  ) : hasPassword ? (
                    <FormattedMessage
                      id="changePasswordSaveBtn"
                      defaultMessage="Passwort speichern"
                    />
                  ) : (
                    <FormattedMessage
                      id="setPasswordSaveBtn"
                      defaultMessage="Passwort setzen"
                    />
                  )}
                </Button>
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}