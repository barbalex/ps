import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import {
  getAuthBaseUrl,
  getAuthRequestHeaders,
  signOut,
  useSession,
} from '../modules/authClient.ts'
import { getVerificationDeadlineMs } from '../modules/emailVerificationGrace.ts'
import styles from './EmailVerificationBanner.module.css'

const formatRemaining = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    '0',
  )
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export const EmailVerificationBanner = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [now, setNow] = useState(Date.now())
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationOtp, setVerificationOtp] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusIsError, setStatusIsError] = useState(false)
  const logoutTriggeredRef = useRef(false)

  const user = session?.user as
    | {
        email?: string
        emailVerified?: boolean
        createdAt?: string
      }
    | undefined

  const deadlineMs = useMemo(() => getVerificationDeadlineMs(user), [user])
  const isUnverified = Boolean(user && !user.emailVerified && deadlineMs)
  const remainingMs = (deadlineMs ?? 0) - now

  useEffect(() => {
    if (!isUnverified) {
      logoutTriggeredRef.current = false
      return
    }

    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(id)
    }
  }, [isUnverified])

  useEffect(() => {
    if (!isUnverified || remainingMs > 0 || logoutTriggeredRef.current) return

    logoutTriggeredRef.current = true
    signOut()
      .catch(() => undefined)
      .finally(() => {
        navigate({
          to: '/auth',
          search: {
            redirect: '/data/projects',
            verificationExpired: true,
          },
        })
      })
  }, [isUnverified, navigate, remainingMs])

  const resendVerification = async () => {
    const email = user?.email?.trim()
    if (!email) return

    setIsSending(true)
    setStatusMessage('')
    setStatusIsError(false)

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
            email,
            type: 'email-verification',
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`verification resend failed: ${response.status}`)
      }

      setStatusMessage(
        formatMessage({
          id: 'authVerificationCodeSent',
          defaultMessage: 'Bestätigungscode gesendet. Bitte E-Mail prüfen.',
        }),
      )
    } catch {
      setStatusIsError(true)
      setStatusMessage(
        formatMessage({
          id: 'authVerificationCodeSendFailed',
          defaultMessage: 'Bestätigungscode konnte nicht gesendet werden.',
        }),
      )
    } finally {
      setIsSending(false)
    }
  }

  const verifyEmail = async () => {
    const email = user?.email?.trim()
    const otp = verificationOtp.trim()
    if (!email || !otp) return

    setIsVerifying(true)
    setStatusMessage('')
    setStatusIsError(false)

    try {
      const response = await fetch(
        `${getAuthBaseUrl()}/auth/email-otp/verify-email`,
        {
          method: 'POST',
          headers: getAuthRequestHeaders({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({ email, otp }),
        },
      )

      if (!response.ok) {
        throw new Error(`verification failed: ${response.status}`)
      }

      setVerificationOtp('')
      setStatusMessage(
        formatMessage({
          id: 'authEmailVerifiedSuccess',
          defaultMessage: 'E-Mail erfolgreich bestätigt.',
        }),
      )

      // Trigger session refresh for components relying on useSession.
      window.location.reload()
    } catch {
      setStatusIsError(true)
      setStatusMessage(
        formatMessage({
          id: 'authEmailVerifyFailed',
          defaultMessage: 'E-Mail-Bestätigung fehlgeschlagen.',
        }),
      )
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isUnverified) return null

  return (
    <div className={styles.container}>
      <p className={styles.message}>
        {formatMessage(
          {
            id: 'authVerifyEmailBanner',
            defaultMessage:
              'Bitte E-Mail-Adresse bestätigen. Ohne Bestätigung werden Sie in {timeRemaining} abgemeldet.',
          },
          { timeRemaining: formatRemaining(remainingMs) },
        )}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={resendVerification}
          disabled={isSending}
        >
          {isSending
            ? formatMessage({
                id: 'authPleaseWait',
                defaultMessage: 'Bitte warten...',
              })
            : formatMessage({
                id: 'authResendVerificationEmailBtn',
                defaultMessage: 'Code erneut senden',
              })}
        </button>
        <div className={styles.otpGroup}>
          <input
            type="text"
            className={styles.otpInput}
            value={verificationOtp}
            onChange={(event) => setVerificationOtp(event.target.value)}
            placeholder={formatMessage({
              id: 'authVerificationOtpPlaceholder',
              defaultMessage: 'Code eingeben',
            })}
            disabled={isVerifying}
          />
          <button
            type="button"
            className={styles.otpVerifyBtn}
            onClick={verifyEmail}
            disabled={isVerifying || !verificationOtp.trim()}
          >
            {isVerifying
              ? formatMessage({
                  id: 'authPleaseWait',
                  defaultMessage: 'Bitte warten...',
                })
              : formatMessage({
                  id: 'authVerifyEmailBtn',
                  defaultMessage: 'Bestätigen',
                })}
          </button>
        </div>
        {statusMessage && (
          <p
            className={styles.info}
            style={statusIsError ? { color: '#9f2f00' } : undefined}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  )
}
