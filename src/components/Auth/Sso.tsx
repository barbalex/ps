import { useState } from 'react'
import { useIntl } from 'react-intl'

import { signIn } from '../../modules/authClient.ts'
import styles from './Auth.module.css'

type SsoProps = {
  redirectTo: string
}

export const Sso = ({ redirectTo }: SsoProps) => {
  const { formatMessage } = useIntl()
  const googleSignInLabel = formatMessage({
    id: 'authGoogleBtn',
    defaultMessage: 'Mit Google anmelden',
  })
  const ssoSectionLabel = formatMessage({
    id: 'authSectionSso',
    defaultMessage: '2. Social Sign-On (SSO)',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setError('')
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

  return (
    <div className={styles.authSection}>
      <h2 className={styles.sectionTitle}>{ssoSectionLabel}</h2>
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
    </div>
  )
}
