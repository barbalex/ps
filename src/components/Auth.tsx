import { useState, FormEvent, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { signUp, signIn, getSession, emailOtp } from '../modules/authClient.ts'
import styles from './Auth.module.css'

export const Auth = () => {
  const { formatMessage } = useIntl()
  const signInLabel = formatMessage({
    id: 'authSignInBtn',
    defaultMessage: 'Anmelden',
  })
  const signUpLabel = formatMessage({
    id: 'authSignUpBtn',
    defaultMessage: 'Registrieren',
  })
  const googleSignInLabel = formatMessage({
    id: 'authGoogleBtn',
    defaultMessage: 'Mit Google fortfahren',
  })
  const verifyEmailLabel = formatMessage({
    id: 'authVerifyEmailBtn',
    defaultMessage: 'E-Mail verifizieren',
  })
  const sendVerificationCodeLabel = formatMessage({
    id: 'authSendVerificationCodeBtn',
    defaultMessage: 'Verifizierungscode senden',
  })
  const requestPasswordResetLabel = formatMessage({
    id: 'authRequestPasswordResetBtn',
    defaultMessage: 'Reset-Code senden',
  })
  const confirmPasswordResetLabel = formatMessage({
    id: 'authConfirmPasswordResetBtn',
    defaultMessage: 'Passwort mit Code zurücksetzen',
  })
  const accountToolsShowLabel = formatMessage({
    id: 'authAccountToolsShow',
    defaultMessage: 'Verifizierung & Passwort-Reset',
  })
  const accountToolsHideLabel = formatMessage({
    id: 'authAccountToolsHide',
    defaultMessage: 'Verifizierung & Passwort-Reset ausblenden',
  })
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showAccountTools, setShowAccountTools] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationOtp, setVerificationOtp] = useState('')
  const [isVerificationLoading, setIsVerificationLoading] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [passwordResetRequested, setPasswordResetRequested] = useState(false)
  const [passwordResetOtp, setPasswordResetOtp] = useState('')
  const [passwordResetNewPassword, setPasswordResetNewPassword] = useState('')
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    name?: string
    verificationOtp?: string
    passwordResetOtp?: string
    passwordResetNewPassword?: string
  }>({})

  const onLoggedIn = useCallback(() => {
    navigate('/data/projects')
  }, [navigate])

  useEffect(() => {
    let isActive = true

    const run = async () => {
      try {
        const result = await getSession({
          query: { disableCookieCache: true },
        })
        const session =
          result && typeof result === 'object' && 'data' in result
            ? result.data
            : result
        if (isActive && session?.user) {
          onLoggedIn()
        }
      } catch {
        // stay on auth form when no valid session exists
      }
    }

    run()

    return () => {
      isActive = false
    }
  }, [onLoggedIn])

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/data/projects`,
      })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authGoogleFailed',
              defaultMessage:
                'Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
            }),
        )
      }
    } catch (err) {
      setError(
        formatMessage({
          id: 'authGoogleFailed',
          defaultMessage:
            'Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
        }),
      )
      console.error('Google auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const errors: typeof fieldErrors = {}

    if (!email) {
      errors.email = formatMessage({
        id: 'authEmailRequired',
        defaultMessage: 'E-Mail ist erforderlich',
      })
    } else if (!validateEmail(email)) {
      errors.email = formatMessage({
        id: 'authInvalidEmail',
        defaultMessage: 'Bitte gültige E-Mail eingeben',
      })
    }

    if (!password) {
      errors.password = formatMessage({
        id: 'authPasswordRequired',
        defaultMessage: 'Passwort ist erforderlich',
      })
    } else if (password.length < 8) {
      errors.password = formatMessage({
        id: 'authPasswordTooShort',
        defaultMessage: 'Passwort muss mindestens 8 Zeichen lang sein',
      })
    }

    if (isSignUp) {
      if (!name) {
        errors.name = formatMessage({
          id: 'authNameRequired',
          defaultMessage: 'Name ist erforderlich',
        })
      }

      if (!confirmPassword) {
        errors.confirmPassword = formatMessage({
          id: 'authConfirmPasswordRequired',
          defaultMessage: 'Bitte Passwort bestätigen',
        })
      } else if (password !== confirmPassword) {
        errors.confirmPassword = formatMessage({
          id: 'authPasswordMismatch',
          defaultMessage: 'Passwörter stimmen nicht überein',
        })
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateEmailOnly = () => {
    const errors: typeof fieldErrors = {}

    if (!email) {
      errors.email = formatMessage({
        id: 'authEmailRequired',
        defaultMessage: 'E-Mail ist erforderlich',
      })
    } else if (!validateEmail(email)) {
      errors.email = formatMessage({
        id: 'authInvalidEmail',
        defaultMessage: 'Bitte gültige E-Mail eingeben',
      })
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSendEmailVerificationOtp = async () => {
    setError('')
    setPasswordResetMessage('')
    setVerificationMessage('')

    if (!validateEmailOnly()) {
      return
    }

    setIsVerificationLoading(true)
    try {
      const result = await emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authVerificationCodeSendFailed',
              defaultMessage:
                'Verifizierungscode konnte nicht gesendet werden.',
            }),
        )
        return
      }

      setVerificationMessage(
        formatMessage({
          id: 'authVerificationCodeSent',
          defaultMessage: 'Verifizierungscode gesendet. Bitte E-Mail prüfen.',
        }),
      )
    } catch (err) {
      setError(
        formatMessage({
          id: 'authVerificationCodeSendFailed',
          defaultMessage: 'Verifizierungscode konnte nicht gesendet werden.',
        }),
      )
      console.error('Verification OTP send error:', err)
    } finally {
      setIsVerificationLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    setError('')
    setPasswordResetMessage('')
    setVerificationMessage('')

    const errors: typeof fieldErrors = {}
    if (!validateEmail(email)) {
      errors.email = formatMessage({
        id: 'authInvalidEmail',
        defaultMessage: 'Bitte gültige E-Mail eingeben',
      })
    }
    if (!verificationOtp) {
      errors.verificationOtp = formatMessage({
        id: 'authOtpRequired',
        defaultMessage: 'Code ist erforderlich',
      })
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsVerificationLoading(true)
    try {
      const result = await emailOtp.verifyEmail({
        email,
        otp: verificationOtp,
      })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authEmailVerifyFailed',
              defaultMessage: 'E-Mail-Verifizierung fehlgeschlagen.',
            }),
        )
        return
      }

      setVerificationMessage(
        formatMessage({
          id: 'authEmailVerifiedSuccess',
          defaultMessage: 'E-Mail wurde erfolgreich verifiziert.',
        }),
      )
      setVerificationOtp('')
    } catch (err) {
      setError(
        formatMessage({
          id: 'authEmailVerifyFailed',
          defaultMessage: 'E-Mail-Verifizierung fehlgeschlagen.',
        }),
      )
      console.error('Email verify error:', err)
    } finally {
      setIsVerificationLoading(false)
    }
  }

  const handleRequestPasswordReset = async () => {
    setError('')
    setVerificationMessage('')
    setPasswordResetMessage('')

    if (!validateEmailOnly()) {
      return
    }

    setIsPasswordResetLoading(true)
    try {
      const result = await emailOtp.requestPasswordReset({ email })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authPasswordResetCodeSendFailed',
              defaultMessage: 'Reset-Code konnte nicht gesendet werden.',
            }),
        )
        return
      }

      setPasswordResetRequested(true)
      setPasswordResetMessage(
        formatMessage({
          id: 'authPasswordResetCodeSent',
          defaultMessage: 'Reset-Code gesendet. Bitte E-Mail prüfen.',
        }),
      )
    } catch (err) {
      setError(
        formatMessage({
          id: 'authPasswordResetCodeSendFailed',
          defaultMessage: 'Reset-Code konnte nicht gesendet werden.',
        }),
      )
      console.error('Password reset OTP request error:', err)
    } finally {
      setIsPasswordResetLoading(false)
    }
  }

  const handleResetPasswordWithOtp = async () => {
    setError('')
    setVerificationMessage('')
    setPasswordResetMessage('')

    const errors: typeof fieldErrors = {}
    if (!validateEmail(email)) {
      errors.email = formatMessage({
        id: 'authInvalidEmail',
        defaultMessage: 'Bitte gültige E-Mail eingeben',
      })
    }
    if (!passwordResetOtp) {
      errors.passwordResetOtp = formatMessage({
        id: 'authOtpRequired',
        defaultMessage: 'Code ist erforderlich',
      })
    }
    if (!passwordResetNewPassword) {
      errors.passwordResetNewPassword = formatMessage({
        id: 'authPasswordRequired',
        defaultMessage: 'Passwort ist erforderlich',
      })
    } else if (passwordResetNewPassword.length < 8) {
      errors.passwordResetNewPassword = formatMessage({
        id: 'authPasswordTooShort',
        defaultMessage: 'Passwort muss mindestens 8 Zeichen lang sein',
      })
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsPasswordResetLoading(true)
    try {
      const result = await emailOtp.resetPassword({
        email,
        otp: passwordResetOtp,
        password: passwordResetNewPassword,
      })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authPasswordResetFailed',
              defaultMessage: 'Passwort-Reset fehlgeschlagen.',
            }),
        )
        return
      }

      setPasswordResetMessage(
        formatMessage({
          id: 'authPasswordResetSuccess',
          defaultMessage:
            'Passwort erfolgreich zurückgesetzt. Jetzt mit neuem Passwort anmelden.',
        }),
      )
      setPasswordResetOtp('')
      setPasswordResetNewPassword('')
      setPasswordResetRequested(false)
    } catch (err) {
      setError(
        formatMessage({
          id: 'authPasswordResetFailed',
          defaultMessage: 'Passwort-Reset fehlgeschlagen.',
        }),
      )
      console.error('Password reset error:', err)
    } finally {
      setIsPasswordResetLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setVerificationMessage('')
    setPasswordResetMessage('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
          callbackURL: '/data/projects',
        })

        if (result.error) {
          setError(
            result.error.message ||
              formatMessage({
                id: 'authSignUpFailed',
                defaultMessage:
                  'Registrierung fehlgeschlagen. Bitte erneut versuchen.',
              }),
          )
        } else {
          onLoggedIn()
        }
      } else {
        const result = await signIn.email({
          email,
          password,
          callbackURL: '/data/projects',
        })

        if (result.error) {
          setError(
            result.error.message ||
              formatMessage({
                id: 'authInvalidCredentials',
                defaultMessage: 'Ungültige E-Mail oder Passwort.',
              }),
          )
        } else {
          onLoggedIn()
        }
      }
    } catch (err) {
      setError(
        formatMessage({
          id: 'authUnexpectedError',
          defaultMessage:
            'Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.',
        }),
      )
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setVerificationMessage('')
    setPasswordResetMessage('')
    setFieldErrors({})
    setPassword('')
    setConfirmPassword('')
    setVerificationOtp('')
    setPasswordResetRequested(false)
    setPasswordResetOtp('')
    setPasswordResetNewPassword('')
    setShowAccountTools(false)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {isSignUp
              ? formatMessage({
                  id: 'authCreateAccount',
                  defaultMessage: 'Konto erstellen',
                })
              : formatMessage({
                  id: 'authWelcomeBack',
                  defaultMessage: 'Anmeldung',
                })}
          </h1>
          <p className={styles.authSubtitle}>
            {isSignUp
              ? formatMessage({
                  id: 'authSignUpToStart',
                  defaultMessage: 'Registrieren, um loszulegen',
                })
              : formatMessage({
                  id: 'authSignInToContinue',
                  defaultMessage: 'Benutzer haben massgeschneiderte Rechte',
                })}
          </p>
          <p className={styles.previewHint}>
            {formatMessage({
              id: 'authPreviewCredentialsHint',
              defaultMessage:
                'Während die App gebaut wird, können Sie mit einem Test-Benutzer anmelden: E-Mail test@test.ch, Passwort test-test',
            })}
          </p>
        </div>

        {error && <div className={styles.generalError}>{error}</div>}
        {verificationMessage && (
          <div className={styles.successMessage}>{verificationMessage}</div>
        )}
        {passwordResetMessage && (
          <div className={styles.successMessage}>{passwordResetMessage}</div>
        )}

        <button
          type="button"
          className={styles.socialButton}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <span className={styles.googleMark} aria-hidden="true">
            G
          </span>
          {googleSignInLabel}
        </button>

        <div className={styles.socialDivider}>
          <span>
            {formatMessage({
              id: 'authOrDivider',
              defaultMessage: 'oder',
            })}
          </span>
        </div>

        {!isSignUp && (
          <div className={styles.otpActions}>
            <button
              type="button"
              className={styles.accountToolsToggle}
              onClick={() => setShowAccountTools((value) => !value)}
              disabled={
                isLoading || isVerificationLoading || isPasswordResetLoading
              }
            >
              {showAccountTools ? accountToolsHideLabel : accountToolsShowLabel}
            </button>

            {showAccountTools && (
              <div className={styles.accountToolsPanel}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleSendEmailVerificationOtp}
                  disabled={isVerificationLoading || isLoading}
                >
                  {isVerificationLoading
                    ? formatMessage({
                        id: 'authPleaseWait',
                        defaultMessage: 'Bitte warten...',
                      })
                    : sendVerificationCodeLabel}
                </button>
                <div className={styles.formGroup}>
                  <input
                    id="verification-otp"
                    type="text"
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value.trim())}
                    className={`${styles.formInput} ${fieldErrors.verificationOtp ? styles.error : ''}`}
                    placeholder={formatMessage({
                      id: 'authVerificationOtpPlaceholder',
                      defaultMessage: 'Verifizierungscode eingeben',
                    })}
                    disabled={isVerificationLoading || isLoading}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  {fieldErrors.verificationOtp && (
                    <p className={styles.errorMessage}>
                      {fieldErrors.verificationOtp}
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleVerifyEmail}
                    disabled={isVerificationLoading || isLoading}
                  >
                    {isVerificationLoading
                      ? formatMessage({
                          id: 'authPleaseWait',
                          defaultMessage: 'Bitte warten...',
                        })
                      : verifyEmailLabel}
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleRequestPasswordReset}
                  disabled={isPasswordResetLoading || isLoading}
                >
                  {isPasswordResetLoading
                    ? formatMessage({
                        id: 'authPleaseWait',
                        defaultMessage: 'Bitte warten...',
                      })
                    : requestPasswordResetLabel}
                </button>

                {passwordResetRequested && (
                  <div className={styles.formGroup}>
                    <input
                      id="password-reset-otp"
                      type="text"
                      value={passwordResetOtp}
                      onChange={(e) =>
                        setPasswordResetOtp(e.target.value.trim())
                      }
                      className={`${styles.formInput} ${fieldErrors.passwordResetOtp ? styles.error : ''}`}
                      placeholder={formatMessage({
                        id: 'authPasswordResetOtpPlaceholder',
                        defaultMessage: 'Reset-Code eingeben',
                      })}
                      disabled={isPasswordResetLoading || isLoading}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    {fieldErrors.passwordResetOtp && (
                      <p className={styles.errorMessage}>
                        {fieldErrors.passwordResetOtp}
                      </p>
                    )}
                    <input
                      id="password-reset-new-password"
                      type="password"
                      value={passwordResetNewPassword}
                      onChange={(e) =>
                        setPasswordResetNewPassword(e.target.value)
                      }
                      className={`${styles.formInput} ${fieldErrors.passwordResetNewPassword ? styles.error : ''}`}
                      placeholder={formatMessage({
                        id: 'authPasswordResetNewPasswordPlaceholder',
                        defaultMessage: 'Neues Passwort eingeben',
                      })}
                      disabled={isPasswordResetLoading || isLoading}
                    />
                    {fieldErrors.passwordResetNewPassword && (
                      <p className={styles.errorMessage}>
                        {fieldErrors.passwordResetNewPassword}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={handleResetPasswordWithOtp}
                      disabled={isPasswordResetLoading || isLoading}
                    >
                      {isPasswordResetLoading
                        ? formatMessage({
                            id: 'authPleaseWait',
                            defaultMessage: 'Bitte warten...',
                          })
                        : confirmPasswordResetLabel}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                {formatMessage({ id: 'authNameLabel', defaultMessage: 'Name' })}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.formInput} ${fieldErrors.name ? styles.error : ''}`}
                placeholder={formatMessage({
                  id: 'authEnterName',
                  defaultMessage: 'Namen eingeben',
                })}
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className={styles.errorMessage}>{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              {formatMessage({
                id: 'authEmailLabel',
                defaultMessage: 'E-Mail',
              })}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.formInput} ${fieldErrors.email ? styles.error : ''}`}
              placeholder={formatMessage({
                id: 'authEnterEmail',
                defaultMessage: 'E-Mail eingeben',
              })}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className={styles.errorMessage}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              {formatMessage({
                id: 'authPasswordLabel',
                defaultMessage: 'Passwort',
              })}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.formInput} ${fieldErrors.password ? styles.error : ''}`}
              placeholder={formatMessage({
                id: 'authEnterPassword',
                defaultMessage: 'Passwort eingeben',
              })}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className={styles.errorMessage}>{fieldErrors.password}</p>
            )}
          </div>

          {isSignUp && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                {formatMessage({
                  id: 'authConfirmPasswordLabel',
                  defaultMessage: 'Passwort bestätigen',
                })}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.formInput} ${fieldErrors.confirmPassword ? styles.error : ''}`}
                placeholder={formatMessage({
                  id: 'authConfirmPasswordInput',
                  defaultMessage: 'Passwort bestätigen',
                })}
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <p className={styles.errorMessage}>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading
              ? formatMessage({
                  id: 'authPleaseWait',
                  defaultMessage: 'Bitte warten...',
                })
              : isSignUp
                ? signUpLabel
                : signInLabel}
          </button>
        </form>

        <div className={styles.toggleContainer}>
          <p className={styles.toggleText}>
            {isSignUp
              ? formatMessage({
                  id: 'authHaveAccount',
                  defaultMessage: 'Bereits ein Konto?',
                })
              : formatMessage({
                  id: 'authNoAccount',
                  defaultMessage: 'Noch kein Konto?',
                })}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleButton}
            disabled={isLoading}
          >
            {isSignUp ? signInLabel : signUpLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
