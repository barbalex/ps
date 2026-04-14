import { useState, FormEvent, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import {
  authClient,
  signUp,
  signIn,
  getSession,
  getAuthBaseUrl,
  getAuthRequestHeaders,
} from '../../modules/authClient.ts'
import styles from './Auth.module.css'

type TwoFactorMethod = 'otp' | 'totp'

const TWO_FACTOR_PREFERRED_METHOD_KEY = 'twoFactorPreferredMethod'

type EmailPasswordProps = {
  onLoggedIn: (onError?: (msg: string) => void) => Promise<void>
  isSignUp: boolean
  setIsSignUp: (value: boolean) => void
  redirectTo: string
  verificationExpired: boolean
}

export const EmailPassword = ({
  onLoggedIn,
  isSignUp,
  setIsSignUp,
  redirectTo,
  verificationExpired,
}: EmailPasswordProps) => {
  const { formatMessage } = useIntl()
  const signInLabel = formatMessage({
    id: 'authSignInBtn',
    defaultMessage: 'Anmelden',
  })
  const signUpLabel = formatMessage({
    id: 'authSignUpBtn',
    defaultMessage: 'Registrieren',
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
  const showPasswordLabel = formatMessage({
    defaultMessage: 'Passwort anzeigen',
  })
  const hidePasswordLabel = formatMessage({
    defaultMessage: 'Passwort verbergen',
  })
  const emailPasswordSectionLabel = formatMessage({
    id: 'authSectionEmailPassword',
    defaultMessage: '1. Email & Password',
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordResetToken, setPasswordResetToken] = useState('')
  const [passwordResetNewPassword, setPasswordResetNewPassword] = useState('')
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false)
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
    passwordResetNewPassword?: string
  }>({})
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationOtp, setVerificationOtp] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [verificationResendSent, setVerificationResendSent] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationMessageIsError, setVerificationMessageIsError] =
    useState(false)
  const [emailVerifiedInForm, setEmailVerifiedInForm] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorMethods, setTwoFactorMethods] = useState<TwoFactorMethod[]>(
    [],
  )
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>('otp')
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false)
  const [twoFactorMessage, setTwoFactorMessage] = useState('')
  const [twoFactorMessageIsError, setTwoFactorMessageIsError] = useState(false)
  const isSignInSubmitDisabled =
    !isSignUp &&
    (twoFactorRequired
      ? !twoFactorCode.trim()
      : !email.trim() || !password.trim())
  const isSignUpSubmitDisabled =
    isSignUp &&
    (!email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      password !== confirmPassword)

  useEffect(() => {
    if (!verificationExpired) return

    setError(
      formatMessage({
        id: 'authVerificationGraceExpired',
        defaultMessage:
          'Bitte E-Mail bestätigen. Die 1-stündige Frist ist abgelaufen.',
      }),
    )
  }, [formatMessage, verificationExpired])

  useEffect(() => {
    // Check for reset token in URL query params
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setPasswordResetToken(token)
      setShowForgotPassword(true)
    }
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const pickTwoFactorMethod = (methods: TwoFactorMethod[]) => {
    if (!methods.length) return 'otp' as TwoFactorMethod
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(TWO_FACTOR_PREFERRED_METHOD_KEY)
        : null
    if (saved === 'otp' || saved === 'totp') {
      if (methods.includes(saved)) return saved
    }
    if (methods.includes('otp')) return 'otp'
    if (methods.includes('totp')) return 'totp'
    return methods[0]
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
          defaultMessage:
            'Passwort erfolgreich zurückgesetzt. Sie werden in Kürze angemeldet.',
        }),
      )
      setPasswordResetNewPassword('')

      // Clear token and redirect after success
      setTimeout(() => {
        onLoggedIn(setError)
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

  const sendTwoFactorOtp = async () => {
    setIsTwoFactorLoading(true)
    setTwoFactorMessage('')
    setTwoFactorMessageIsError(false)

    try {
      const result = await authClient.twoFactor.sendOtp({ trustDevice: true })
      if (result.error) {
        throw new Error(result.error.message || 'two-factor otp send failed')
      }

      setTwoFactorMessage(
        formatMessage({
          id: 'authTwoFactorCodeSent',
          defaultMessage:
            '2FA-Code gesendet. Bitte E-Mail prüfen und Code eingeben.',
        }),
      )
    } catch {
      setTwoFactorMessageIsError(true)
      setTwoFactorMessage(
        formatMessage({
          id: 'authTwoFactorSendFailed',
          defaultMessage:
            '2FA-Code konnte nicht gesendet werden. Bitte erneut versuchen.',
        }),
      )
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  const verifyTwoFactorAndLogin = async () => {
    const code = twoFactorCode.trim()
    if (!code) return

    setIsTwoFactorLoading(true)
    setTwoFactorMessage('')
    setTwoFactorMessageIsError(false)

    try {
      const result =
        twoFactorMethod === 'totp'
          ? await authClient.twoFactor.verifyTotp({
              code,
              trustDevice: true,
            })
          : await authClient.twoFactor.verifyOtp({
              code,
              trustDevice: true,
            })

      if (result.error) {
        throw new Error(result.error.message || 'two-factor verify failed')
      }

      setTwoFactorRequired(false)
      setTwoFactorMethods([])
      setTwoFactorCode('')
      await onLoggedIn(setError)
    } catch {
      setTwoFactorMessageIsError(true)
      setTwoFactorMessage(
        formatMessage({
          id:
            twoFactorMethod === 'totp'
              ? 'authTwoFactorAppVerifyFailed'
              : 'authTwoFactorVerifyFailed',
          defaultMessage:
            twoFactorMethod === 'totp'
              ? 'Authenticator-Code ungültig oder abgelaufen.'
              : '2FA-Code ungültig oder abgelaufen.',
        }),
      )
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setShowRegisterSuggestion(false)
    setPasswordResetMessage('')

    if (!isSignUp && twoFactorRequired) {
      await verifyTwoFactorAndLogin()
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const normalizedEmail = email.trim()
      const fallbackName = normalizedEmail.split('@')[0] || normalizedEmail

      if (isSignUp) {
        const result = await signUp.email({
          email: normalizedEmail,
          name: fallbackName,
          password,
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
          const sessionResult = await getSession({
            query: { disableCookieCache: true },
          })
          const freshSession =
            sessionResult &&
            typeof sessionResult === 'object' &&
            'data' in sessionResult
              ? sessionResult.data
              : sessionResult

          if (freshSession?.user) {
            await onLoggedIn(setError)
          } else {
            setIsSignUp(false)
            setPassword('')
            setConfirmPassword('')
            setPasswordResetMessage(
              formatMessage({
                id: 'authSignUpSucceededCheckEmail',
                defaultMessage:
                  'Registrierung erfolgreich. Bitte E-Mail-Bestätigung abschliessen und danach anmelden.',
              }),
            )
          }
        }
      } else {
        const result = await signIn.email({
          email: normalizedEmail,
          password,
          callbackURL: redirectTo,
        })

        const resultData =
          result && typeof result === 'object' && 'data' in result
            ? result.data
            : result

        if (
          resultData &&
          typeof resultData === 'object' &&
          'twoFactorRedirect' in resultData &&
          (resultData as { twoFactorRedirect?: boolean }).twoFactorRedirect
        ) {
          const methods = (
            (resultData as { twoFactorMethods?: string[] }).twoFactorMethods ??
            []
          ).filter(
            (method): method is TwoFactorMethod =>
              method === 'otp' || method === 'totp',
          )
          const selectedMethod = pickTwoFactorMethod(methods)

          setTwoFactorRequired(true)
          setTwoFactorMethods(methods)
          setTwoFactorMethod(selectedMethod)
          setTwoFactorCode('')
          if (selectedMethod === 'otp' && methods.includes('otp')) {
            await sendTwoFactorOtp()
          } else {
            setTwoFactorMessage(
              formatMessage({
                id: 'authTwoFactorAppPrompt',
                defaultMessage:
                  'Bitte den Code aus Ihrer Authenticator-App eingeben.',
              }),
            )
            setTwoFactorMessageIsError(false)
          }
          return
        }

        if (result.error) {
          setShowRegisterSuggestion(
            isCredentialErrorMessage(result.error.message),
          )
          setError(getLocalizedSignInError(result.error.message))
        } else {
          await onLoggedIn(setError)
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
    const nextIsSignUp = !isSignUp
    setIsSignUp(nextIsSignUp)
    setError('')
    setShowRegisterSuggestion(false)
    setPasswordResetMessage('')
    setFieldErrors({})
    setTwoFactorRequired(false)
    setTwoFactorMethods([])
    setTwoFactorMethod('otp')
    setTwoFactorCode('')
    setTwoFactorMessage('')
    setTwoFactorMessageIsError(false)
    if (!nextIsSignUp) {
      setPassword('')
    }
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
    setConfirmPassword('')
    setFieldErrors({})
    setShowForgotPassword(false)
    setPasswordResetNewPassword('')
    setPasswordResetMessage('')
    setTwoFactorRequired(false)
    setTwoFactorMethods([])
    setTwoFactorMethod('otp')
    setTwoFactorCode('')
    setTwoFactorMessage('')
    setTwoFactorMessageIsError(false)
  }

  const handleResendVerification = async () => {
    const emailTrimmed = email.trim()
    if (!emailTrimmed) return

    setIsSendingVerification(true)
    setVerificationMessage('')
    setVerificationMessageIsError(false)

    try {
      const response = await fetch(
        `${getAuthBaseUrl()}/auth/email-otp/send-verification-otp`,
        {
          method: 'POST',
          headers: getAuthRequestHeaders({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({
            email: emailTrimmed,
            type: 'email-verification',
          }),
        },
      )
      if (!response.ok) throw new Error(`${response.status}`)

      setVerificationResendSent(true)
      setVerificationMessage(
        formatMessage({
          id: 'authVerificationCodeSent',
          defaultMessage: 'Verification code sent. Please check your email.',
        }),
      )
    } catch {
      setVerificationMessageIsError(true)
      setVerificationMessage(
        formatMessage({
          id: 'authVerificationCodeSendFailed',
          defaultMessage: 'Failed to send verification code.',
        }),
      )
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleVerifyOtp = async () => {
    const emailTrimmed = email.trim()
    const otp = verificationOtp.trim()
    if (!emailTrimmed || !otp) return

    setIsVerifyingOtp(true)
    setVerificationMessage('')
    setVerificationMessageIsError(false)

    try {
      const response = await fetch(
        `${getAuthBaseUrl()}/auth/email-otp/verify-email`,
        {
          method: 'POST',
          headers: getAuthRequestHeaders({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({ email: emailTrimmed, otp }),
        },
      )
      if (!response.ok) throw new Error(`${response.status}`)

      setEmailVerifiedInForm(true)
      setVerificationOtp('')
      setVerificationMessage(
        formatMessage({
          id: 'authEmailVerifiedSuccess',
          defaultMessage: 'Email verified successfully.',
        }),
      )
    } catch {
      setVerificationMessageIsError(true)
      setVerificationMessage(
        formatMessage({
          id: 'authEmailVerifyFailed',
          defaultMessage: 'Email verification failed.',
        }),
      )
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const onSwitchTwoFactorMethod = async (method: TwoFactorMethod) => {
    if (method === twoFactorMethod) return
    setTwoFactorMethod(method)
    setTwoFactorCode('')
    setTwoFactorMessage('')
    setTwoFactorMessageIsError(false)

    if (method === 'otp') {
      await sendTwoFactorOtp()
      return
    }

    setTwoFactorMessage(
      formatMessage({
        id: 'authTwoFactorAppPrompt',
        defaultMessage: 'Bitte den Code aus Ihrer Authenticator-App eingeben.',
      }),
    )
  }

  return (
    <>
      {error && !emailVerifiedInForm && (
        <div className={styles.generalError}>{error}</div>
      )}
      {emailVerifiedInForm && (
        <div className={styles.successMessage}>
          {formatMessage({
            id: 'authEmailVerifiedNowSignIn',
            defaultMessage:
              'E-Mail erfolgreich bestätigt. Bitte jetzt anmelden.',
          })}
        </div>
      )}
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
        {!isSignUp && (
          <h2 className={styles.sectionTitle}>{emailPasswordSectionLabel}</h2>
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
              setTwoFactorRequired(false)
              setTwoFactorCode('')
              setTwoFactorMessage('')
              setTwoFactorMessageIsError(false)
            }}
            className={`${styles.formInput} ${fieldErrors.email ? styles.error : ''}`}
            placeholder={formatMessage({
              id: 'authEnterEmail',
              defaultMessage: 'E-Mail eingeben',
            })}
            autoComplete="username webauthn"
            disabled={isLoading}
          />
          {fieldErrors.email && (
            <p className={styles.errorMessage}>{fieldErrors.email}</p>
          )}
          {verificationExpired && !isSignUp && !emailVerifiedInForm && (
            <div
              className={`${styles.otpActions} ${styles.emailVerificationInline}`}
            >
              <p className={styles.inlinePromptText}>
                {formatMessage({
                  id: 'authResendVerificationPromptPrefix',
                  defaultMessage: 'E-Mail-Adresse oben eingeben und',
                })}{' '}
                <button
                  type="button"
                  className={styles.inlineTextLink}
                  onClick={handleResendVerification}
                  disabled={
                    isSendingVerification || isLoading || !email.trim()
                  }
                >
                  {isSendingVerification
                    ? formatMessage({
                        id: 'authPleaseWait',
                        defaultMessage: 'Bitte warten...',
                      })
                    : formatMessage({
                        id: 'authRequestVerificationCodeLink',
                        defaultMessage: 'neuen Bestätigungscode anfordern',
                      })}
                </button>
                .
              </p>
              {verificationResendSent && (
                <>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value)}
                    placeholder={formatMessage({
                      id: 'authVerificationOtpPlaceholder',
                      defaultMessage: 'Enter verification code',
                    })}
                    disabled={isVerifyingOtp}
                  />
                  <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || !verificationOtp.trim()}
                  >
                    {isVerifyingOtp
                      ? formatMessage({
                          id: 'authPleaseWait',
                          defaultMessage: 'Bitte warten...',
                        })
                      : formatMessage({
                          id: 'authVerifyEmailBtn',
                          defaultMessage: 'Verify email',
                        })}
                  </button>
                </>
              )}
              {verificationMessage && (
                <p
                  className={styles.toggleText}
                  style={
                    verificationMessageIsError
                      ? { color: '#9f2f00' }
                      : undefined
                  }
                >
                  {verificationMessage}
                </p>
              )}
            </div>
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
                setTwoFactorRequired(false)
                setTwoFactorCode('')
                setTwoFactorMessage('')
                setTwoFactorMessageIsError(false)
              }}
              className={`${styles.formInput} ${styles.passwordInput} ${fieldErrors.password ? styles.error : ''}`}
              placeholder={formatMessage({
                id: 'authEnterPassword',
                defaultMessage: 'Passwort eingeben',
              })}
              autoComplete={
                isSignUp ? 'new-password' : 'current-password webauthn'
              }
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => togglePasswordVisibility('password')}
              aria-label={
                passwordVisibility.password ? hidePasswordLabel : showPasswordLabel
              }
              title={
                passwordVisibility.password ? hidePasswordLabel : showPasswordLabel
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

        {!isSignUp && twoFactorRequired && (
          <div className={styles.otpActions}>
            {twoFactorMethods.length > 1 && twoFactorMethod === 'totp' && (
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={styles.inlineTextLink}
                  onClick={() => onSwitchTwoFactorMethod('otp')}
                  disabled={
                    isTwoFactorLoading ||
                    isLoading ||
                    twoFactorMethod === 'otp'
                  }
                >
                  {formatMessage({
                    id: 'authTwoFactorMethodEmail',
                    defaultMessage: 'E-Mail-Code',
                  })}
                </button>
              </div>
            )}
            <input
              type="text"
              className={styles.formInput}
              value={twoFactorCode}
              onChange={(event) => setTwoFactorCode(event.target.value)}
              placeholder={formatMessage({
                id:
                  twoFactorMethod === 'totp'
                    ? 'authTwoFactorAppCodePlaceholder'
                    : 'authTwoFactorCodePlaceholder',
                defaultMessage:
                  twoFactorMethod === 'totp'
                    ? 'Code aus Authenticator-App eingeben'
                    : '2FA-Code eingeben',
              })}
              disabled={isTwoFactorLoading || isLoading}
            />
            {twoFactorMethod === 'otp' && (
              <button
                type="button"
                className={styles.inlineTextLink}
                onClick={sendTwoFactorOtp}
                disabled={isTwoFactorLoading || isLoading}
              >
                {formatMessage({
                  id: 'authTwoFactorResendCode',
                  defaultMessage: 'Code erneut senden',
                })}
              </button>
            )}
            {twoFactorMessage && (
              <p
                className={styles.toggleText}
                style={
                  twoFactorMessageIsError ? { color: '#9f2f00' } : undefined
                }
              >
                {twoFactorMessage}
              </p>
            )}
          </div>
        )}

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
                type={
                  passwordVisibility.confirmPassword ? 'text' : 'password'
                }
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

        {isSignUp ? (
          <div className={styles.signUpSubmitGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || isSignUpSubmitDisabled}
            >
              {isLoading
                ? formatMessage({
                    id: 'authPleaseWait',
                    defaultMessage: 'Bitte warten...',
                  })
                : signUpLabel}
            </button>
            <div className={styles.signUpSwitchLinkWrap}>
              <button
                type="button"
                className={styles.inlineTextLink}
                onClick={toggleMode}
                disabled={isLoading}
              >
                {`${formatMessage({
                  id: 'authHaveAccount',
                  defaultMessage: 'Bereits ein Konto?',
                })} ${signInLabel}`}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.signUpSubmitGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                isLoading || isTwoFactorLoading || isSignInSubmitDisabled
              }
            >
              {isLoading || isTwoFactorLoading
                ? formatMessage({
                    id: 'authPleaseWait',
                    defaultMessage: 'Bitte warten...',
                  })
                : twoFactorRequired
                  ? formatMessage({
                      id: 'authTwoFactorVerifyBtn',
                      defaultMessage: '2FA-Code prüfen',
                    })
                  : signInLabel}
            </button>
            <div className={styles.signUpSwitchLinkWrap}>
              <button
                type="button"
                className={styles.inlineTextLink}
                onClick={toggleMode}
                disabled={isLoading || isPasswordResetLoading}
              >
                {`${formatMessage({
                  id: 'authNoAccount',
                  defaultMessage: 'Noch kein Konto?',
                })} ${signUpLabel}`}
              </button>
            </div>
          </div>
        )}
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
                    defaultMessage:
                      'E-Mail eingeben, um Reset-Link zu erhalten:',
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
                    <p className={styles.errorMessage}>{fieldErrors.email}</p>
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
    </>
  )
}
