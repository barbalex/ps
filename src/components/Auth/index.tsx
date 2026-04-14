import { useState, useEffect, useCallback } from 'react'
import { useSearch, useRouter } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { getSession } from '../../modules/authClient.ts'
import { ensurePgliteDb } from '../../modules/ensurePgliteDb.ts'
import { EmailPassword } from './EmailPassword.tsx'
import { Sso } from './Sso.tsx'
import { Passkeys } from './Passkeys.tsx'
import styles from './Auth.module.css'

export const Auth = () => {
  const { formatMessage } = useIntl()
  const router = useRouter()
  const { redirect: redirectTo, verificationExpired } = useSearch({
    from: '/_layout/auth',
  })
  const [isSignUp, setIsSignUp] = useState(false)

  const onLoggedIn = useCallback(
    async (onError?: (msg: string) => void) => {
      try {
        await ensurePgliteDb()
      } catch (err) {
        console.error('PGlite initialization failed:', err)
        onError?.(
          formatMessage({
            id: 'authUnexpectedError',
            defaultMessage:
              'Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.',
          }),
        )
        return
      }
      // Use router.history.push instead of navigate() to avoid TanStack Router
      // re-applying route search params on top of any search already in redirectTo
      // (navigate({ to }) embeds the path into nextPathname AND appends nextSearch,
      // producing double search params like ?onlyForm=false?onlyForm=false).
      router.history.push(redirectTo)
    },
    [formatMessage, redirectTo, router],
  )

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

        <EmailPassword
          onLoggedIn={onLoggedIn}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          redirectTo={redirectTo}
          verificationExpired={verificationExpired}
        />

        {!isSignUp && (
          <>
            <Sso redirectTo={redirectTo} />
            <Passkeys onLoggedIn={onLoggedIn} />
          </>
        )}
      </div>
    </div>
  )
}
