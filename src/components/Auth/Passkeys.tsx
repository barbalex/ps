import { useState } from 'react'
import { useIntl } from 'react-intl'

import { authClient } from '../../modules/authClient.ts'
import styles from './Auth.module.css'

type PasskeysProps = {
  onLoggedIn: (onError?: (msg: string) => void) => Promise<void>
}

export const Passkeys = ({ onLoggedIn }: PasskeysProps) => {
  const { formatMessage } = useIntl()
  const passkeySignInLabel = formatMessage({
    id: 'authPasskeyBtn',
    defaultMessage: 'Mit Passkey anmelden',
  })
  const passkeySectionLabel = formatMessage({
    id: 'authSectionPasskeys',
    defaultMessage: '3. Passkeys',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePasskeySignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const result = await authClient.signIn.passkey()

      const hasError =
        !!result?.error ||
        !!(
          result &&
          typeof result === 'object' &&
          'data' in result &&
          result.data &&
          typeof result.data === 'object' &&
          'error' in result.data &&
          result.data.error
        )

      if (hasError) {
        const message =
          result?.error?.message ||
          (result &&
            typeof result === 'object' &&
            'data' in result &&
            result.data &&
            typeof result.data === 'object' &&
            'error' in result.data &&
            result.data.error?.message) ||
          formatMessage({
            id: 'authPasskeyFailed',
            defaultMessage:
              'Passkey-Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
          })

        setError(message)
        return
      }

      await onLoggedIn(setError)
    } catch (err) {
      setError(
        formatMessage({
          id: 'authPasskeyFailed',
          defaultMessage:
            'Passkey-Anmeldung fehlgeschlagen. Bitte erneut versuchen.',
        }),
      )
      console.error('Passkey auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.authSection}>
      <h2 className={styles.sectionTitle}>{passkeySectionLabel}</h2>
      {error && <div className={styles.generalError}>{error}</div>}
      <button
        type="button"
        className={styles.socialButton}
        onClick={handlePasskeySignIn}
        disabled={isLoading}
      >
        {passkeySignInLabel}
      </button>
    </div>
  )
}
