import { useState, FormEvent, useEffect, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { authClient, signUp, signIn, getSession } from '../modules/authClient.ts'
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
    defaultMessage: 'Mit Google anmelden',
  })
  const requestPasswordResetLabel = formatMessage({
    id: 'authRequestPasswordResetBtn',
    defaultMessage: 'Reset-Link senden',
  })
  const confirmPasswordResetLabel = formatMessage({
    id: 'authConfirmPasswordResetBtn',
    defaultMessage: 'Passwort ändern',
  })
  const forgotPasswordShowLabel = formatMessage({
    id: 'authForgotPasswordShow',
    defaultMessage: 'Neues Passwort setzen',
  })
  const forgotPasswordHideLabel = formatMessage({
    id: 'authForgotPasswordHide',
    defaultMessage: 'Formular für neues Passwort ausblenden',
  })
  const navigate = useNavigate()
  const { redirect: redirectTo } = useSearch({ from: '/_layout/auth' })
  const showPasswordLabel = formatMessage({
    defaultMessage: 'Passwort anzeigen',
  })
  const hidePasswordLabel = formatMessage({
    defaultMessage: 'Passwort verbergen',
  })
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordResetToken, setPasswordResetToken] = useState('')
  const [passwordResetNewPassword, setPasswordResetNewPassword] = useState('')
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false)
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
    passwordResetNewPassword: false,
  })
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    name?: string
    passwordResetNewPassword?: string
  }>({})

  const onLoggedIn = useCallback(() => {
    navigate({ to: redirectTo })
  }, [navigate, redirectTo])

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

  useEffect(() => {
    // Check for reset token in URL query params
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setPasswordResetToken(token)
      setShowForgotPassword(true)
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setError('')
    setShowRegisterSuggestion(false)
    setIsLoading(true)

    try {
      const result = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}${redirectTo}`,
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

  const isCredentialErrorMessage = (message?: string) => {
    const normalized = (message || '').toLowerCase()
    return (
      normalized.includes('invalid email or password') ||
      normalized.includes('invalid credentials') ||
      normalized.includes('user not found')
    )
  }

  const getLocalizedSignInError = (message?: string) => {
    const looksLikeCredentialError = isCredentialErrorMessage(message)

    if (looksLikeCredentialError) {
      return formatMessage({
        id: 'authInvalidCredentials',
        defaultMessage: 'Ungültige E-Mail oder Passwort.',
      })
    }

    return (
      message ||
      formatMessage({
        id: 'authInvalidCredentials',
        defaultMessage: 'Ungültige E-Mail oder Passwort.',
      })
    )
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

  const handleRequestPasswordReset = async () => {
    setError('')
    setShowRegisterSuggestion(false)
    setPasswordResetMessage('')

    if (!validateEmailOnly()) {
      return
    }

    setIsPasswordResetLoading(true)
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      })

      if (result.error) {
        setError(
          result.error.message ||
            formatMessage({
              id: 'authPasswordResetLinkSendFailed',
              defaultMessage: 'Reset-Link konnte nicht gesendet werden.',
            }),
        )
        return
      }

      setPasswordResetMessage(
        formatMessage({
          id: 'authPasswordResetLinkSent',
          defaultMessage: 'Reset-Link wurde gesendet. Bitte E-Mail prüfen.',
        }),
      )
    } catch (err) {
      setError(
        formatMessage({
          id: 'authPasswordResetLinkSendFailed',
          defaultMessage: 'Reset-Link konnte nicht gesendet werden.',
        }),
      )
      console.error('Password reset link request error:', err)
    } finally {
      setIsPasswordResetLoading(false)
    }
  }

  const handleResetPasswordWithToken = async () => {
    setError('')
    setShowRegisterSuggestion(false)
    setPasswordResetMessage('')

    const errors: typeof fieldErrors = {}
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
      const result = await authClient.resetPassword({
        newPassword: passwordResetNewPassword,
        token: passwordResetToken,
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
          defaultMessage: 'Passwort erfolgreich zurückgesetzt. Sie werden in Kürze angemeldet.',
        }),
      )
      setPasswordResetNewPassword('')
      
      // Clear token and redirect after success
      setTimeout(() => {
        onLoggedIn()
      }, 1500)
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
    setShowRegisterSuggestion(false)
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
          callbackURL: redirectTo,
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
          callbackURL: redirectTo,
        })

        if (result.error) {
          setShowRegisterSuggestion(isCredentialErrorMessage(result.error.message))
          setError(getLocalizedSignInError(result.error.message))
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
    setShowRegisterSuggestion(false)
    setPasswordResetMessage('')
    setFieldErrors({})
    setPassword('')
    setConfirmPassword('')
    setPasswordResetNewPassword('')
    setShowForgotPassword(false)
    setPasswordVisibility({
      password: false,
      confirmPassword: false,
      passwordResetNewPassword: false,
    })
  }

  const togglePasswordVisibility = (
    field: 'password' | 'confirmPassword' | 'passwordResetNewPassword',
  ) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  const switchToSignUpFromError = () => {
    setIsSignUp(true)
    setShowRegisterSuggestion(false)
    setError('')
    setPassword('')
    setConfirmPassword('')
    setFieldErrors({})
    setShowForgotPassword(false)
    setPasswordResetNewPassword('')
    setPasswordResetMessage('')
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
        {showRegisterSuggestion && !isSignUp && (
          <div className={styles.otpActions}>
            <p className={styles.toggleText}>
              {formatMessage({
                id: 'authRegisterSuggestionText',
                defaultMessage:
                  'Für diese E-Mail gibt es noch kein Konto. Möchten Sie sich registrieren?',
              })}
            </p>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={switchToSignUpFromError}
              disabled={isLoading}
            >
              {formatMessage({
                id: 'authRegisterSuggestionBtn',
                defaultMessage: 'Jetzt registrieren',
              })}
            </button>
          </div>
        )}
        {passwordResetMessage && (
          <div className={styles.successMessage}>{passwordResetMessage}</div>
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
              onChange={(e) => {
                setEmail(e.target.value)
                setShowRegisterSuggestion(false)
              }}
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
            <div className={styles.passwordFieldWrapper}>
              <input
                id="password"
                type={passwordVisibility.password ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setShowRegisterSuggestion(false)
                }}
                className={`${styles.formInput} ${styles.passwordInput} ${fieldErrors.password ? styles.error : ''}`}
                placeholder={formatMessage({
                  id: 'authEnterPassword',
                  defaultMessage: 'Passwort eingeben',
                })}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => togglePasswordVisibility('password')}
                aria-label={
                  passwordVisibility.password
                    ? hidePasswordLabel
                    : showPasswordLabel
                }
                title={
                  passwordVisibility.password
                    ? hidePasswordLabel
                    : showPasswordLabel
                }
                disabled={isLoading}
              >
                {passwordVisibility.password ? (
                  <MdVisibilityOff />
                ) : (
                  <MdVisibility />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className={styles.errorMessage}>{fieldErrors.password}</p>
            )}
            {!isSignUp && (
              <button
                type="button"
                className={styles.inlineTextLink}
                onClick={() => setShowForgotPassword((value) => !value)}
                disabled={isLoading || isPasswordResetLoading}
              >
                {showForgotPassword
                  ? forgotPasswordHideLabel
                  : forgotPasswordShowLabel}
              </button>
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
              <div className={styles.passwordFieldWrapper}>
                <input
                  id="confirmPassword"
                  type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${styles.formInput} ${styles.passwordInput} ${fieldErrors.confirmPassword ? styles.error : ''}`}
                  placeholder={formatMessage({
                    id: 'authConfirmPasswordInput',
                    defaultMessage: 'Passwort bestätigen',
                  })}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  aria-label={
                    passwordVisibility.confirmPassword
                      ? hidePasswordLabel
                      : showPasswordLabel
                  }
                  title={
                    passwordVisibility.confirmPassword
                      ? hidePasswordLabel
                      : showPasswordLabel
                  }
                  disabled={isLoading}
                >
                  {passwordVisibility.confirmPassword ? (
                    <MdVisibilityOff />
                  ) : (
                    <MdVisibility />
                  )}
                </button>
              </div>
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
        {!isSignUp && showForgotPassword && (
          <div className={styles.otpActions}>
            <div className={styles.accountToolsPanel}>
              {passwordResetToken ? (
                <>
                  <p className={styles.toggleText}>
                    {formatMessage({
                      id: 'authResetPasswordWithToken',
                      defaultMessage: 'Neues Passwort eingeben:',
                    })}
                  </p>
                  <div className={styles.passwordFieldWrapper}>
                    <input
                      id="password-reset-new-password-token"
                      type={
                        passwordVisibility.passwordResetNewPassword
                          ? 'text'
                          : 'password'
                      }
                      value={passwordResetNewPassword}
                      onChange={(e) =>
                        setPasswordResetNewPassword(e.target.value)
                      }
                      className={`${styles.formInput} ${styles.passwordInput} ${fieldErrors.passwordResetNewPassword ? styles.error : ''}`}
                      placeholder={formatMessage({
                        id: 'authPasswordResetNewPasswordPlaceholder',
                        defaultMessage: 'Neues Passwort eingeben',
                      })}
                      disabled={isPasswordResetLoading || isLoading}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        togglePasswordVisibility('passwordResetNewPassword')
                      }
                      aria-label={
                        passwordVisibility.passwordResetNewPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      title={
                        passwordVisibility.passwordResetNewPassword
                          ? hidePasswordLabel
                          : showPasswordLabel
                      }
                      disabled={isPasswordResetLoading || isLoading}
                    >
                      {passwordVisibility.passwordResetNewPassword ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </button>
                  </div>
                  {fieldErrors.passwordResetNewPassword && (
                    <p className={styles.errorMessage}>
                      {fieldErrors.passwordResetNewPassword}
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleResetPasswordWithToken}
                    disabled={isPasswordResetLoading || isLoading}
                  >
                    {isPasswordResetLoading
                      ? formatMessage({
                          id: 'authPleaseWait',
                          defaultMessage: 'Bitte warten...',
                        })
                      : confirmPasswordResetLabel}
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.toggleText}>
                    {formatMessage({
                      id: 'authSendResetLink',
                      defaultMessage: 'E-Mail eingeben, um Reset-Link zu erhalten:',
                    })}
                  </p>
                  <div className={styles.formGroup}>
                    <input
                      id="password-reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${styles.formInput} ${fieldErrors.email ? styles.error : ''}`}
                      placeholder={formatMessage({
                        id: 'authEnterEmail',
                        defaultMessage: 'E-Mail eingeben',
                      })}
                      disabled={isPasswordResetLoading || isLoading}
                    />
                    {fieldErrors.email && (
                      <p className={styles.errorMessage}>
                        {fieldErrors.email}
                      </p>
                    )}
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
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.socialDivider}>
          <span>
            {formatMessage({
              id: 'authOrDivider',
              defaultMessage: 'oder',
            })}
          </span>
        </div>

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
