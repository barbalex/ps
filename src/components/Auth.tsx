import { useState, FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { signUp, signIn } from '../modules/authClient.ts'
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
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    name?: string
  }>({})

  const onLoggedIn = () => {
    navigate('/data/projects')
  }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

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
    setFieldErrors({})
    setPassword('')
    setConfirmPassword('')
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
