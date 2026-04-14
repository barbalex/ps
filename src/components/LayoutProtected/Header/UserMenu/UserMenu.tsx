import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Avatar,
  Button,
  Menu: FluentMenu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
} = fluentUiReactComponents
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FormattedMessage, useIntl } from 'react-intl'
import { MdFingerprint, MdLock, MdLogout, MdVerifiedUser } from 'react-icons/md'

import { getAuthBaseUrl, signOut } from '../../../../modules/authClient.ts'
import {
  initialSyncingAtom,
  isLoggingOutAtom,
  operationsQueueAtom,
  pgliteDbAtom,
  store,
  syncObjectAtom,
} from '../../../../store.ts'
import { ChangePasswordDialog } from './ChangePasswordDialog.tsx'
import { LogoutDialogs } from './LogoutDialogs.tsx'
import { PasskeyDialog } from './PasskeyDialog.tsx'
import { TwoFactorDialog } from './TwoFactorDialog.tsx'

type AuthUser = {
  email?: string
  fullName?: string
}

type Session = {
  user?: {
    id?: string
    email?: string
    fullName?: string
    accounts?: {
      provider: string
      [key: string]: unknown
    }[]
  }
  [key: string]: unknown
}

type Props = {
  authUser: AuthUser | null | undefined
  session?: Session | null
  buttonClassName: string
}

const deleteIndexedDbDatabase = (dbName: string) =>
  new Promise<boolean>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(true)
      return
    }

    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve(true)
    request.onerror = () => resolve(false)
    request.onblocked = () => resolve(false)
  })

const deleteAppIndexedDbDatabases = async (extraNames: string[] = []) => {
  const fallbackDbNames = [...new Set(['ps', 'idb://ps', ...extraNames])]
  const discoveredDbNames =
    typeof indexedDB !== 'undefined' && 'databases' in indexedDB
      ? await indexedDB
          .databases()
          .then((dbs) => dbs.map((db) => db.name).filter(Boolean) as string[])
          .catch(() => [])
      : []

  const dbNamesToDelete = [...new Set([...fallbackDbNames, ...discoveredDbNames])]

  const deleteResults = await Promise.all(
    dbNamesToDelete.map((name) => deleteIndexedDbDatabase(name)),
  )

  return deleteResults.every(Boolean)
}

const clearBrowserCaches = async () => {
  if (typeof caches === 'undefined') return
  try {
    const cacheKeys = await caches.keys()
    await Promise.all(cacheKeys.map((key) => caches.delete(key)))
  } catch {
    // ignore cache cleanup failures
  }
}

const clearPersistedSyncUiState = () => {
  window.localStorage.clear()
  window.sessionStorage.clear()
}

const waitForPgliteConsumersToUnmount = async () => {
  await Promise.resolve()

  if (typeof window === 'undefined') return
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

const clearLocalSyncedData = async () => {
  // Stop active sync stream first
  const syncObject = store.get(syncObjectAtom) as {
    unsubscribe?: () => void
  } | null
  syncObject?.unsubscribe?.()
  store.set(syncObjectAtom, null)

  const db = store.get(pgliteDbAtom) as { close?: () => Promise<void> | void; dataDir?: string } | null
  const dataDirNames = db?.dataDir ? [db.dataDir] : []
  store.set(pgliteDbAtom, null)

  // Wait for consumers to unmount (navigate away has already happened,
  // but give React one more rAF to settle before closing)
  await waitForPgliteConsumersToUnmount()
  await db?.close?.()

  const dbDeletionSucceeded = await deleteAppIndexedDbDatabases(dataDirNames)
  await clearBrowserCaches()
  clearPersistedSyncUiState()

  store.set(operationsQueueAtom, [])
  store.set(initialSyncingAtom, true)

  if (!dbDeletionSucceeded) {
    console.warn(
      'Some local IndexedDB databases could not be deleted completely.',
    )
  }
}

export const UserMenu = ({ authUser, session, buttonClassName }: Props) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [passkeyOpen, setPasskeyOpen] = useState(false)
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)
  const [twoFactorEnabledServer, setTwoFactorEnabledServer] = useState<
    boolean | undefined
  >(undefined)
  const [hasPasswordServer, setHasPasswordServer] = useState<
    boolean | undefined
  >(undefined)
  const hasPasswordFromSession =
    session?.user?.accounts?.some((account) => {
      const provider = account.provider
      const providerId = (account as { providerId?: string }).providerId
      return provider === 'credential' || providerId === 'credential'
    }) ?? false
  const hasPassword = hasPasswordServer ?? hasPasswordFromSession
  const sessionUserKey = session?.user?.id ?? session?.user?.email ?? ''

  useEffect(() => {
    let isActive = true

    const loadAuthStatus = async () => {
      if (!session?.user) {
        if (isActive) {
          setHasPasswordServer(undefined)
          setTwoFactorEnabledServer(undefined)
        }
        return
      }

      try {
        const response = await fetch(
          `${getAuthBaseUrl()}/auth/two-factor/status`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )
        if (!response.ok) return

        const data = (await response.json()) as {
          enabled?: boolean
          hasPassword?: boolean
        }

        if (isActive) {
          setTwoFactorEnabledServer(Boolean(data.enabled))
          setHasPasswordServer(Boolean(data.hasPassword))
        }
      } catch {
        // Ignore endpoint errors and keep session fallback.
      }
    }

    loadAuthStatus()

    return () => {
      isActive = false
    }
  }, [sessionUserKey, session?.user])

  const twoFactorEnabled = twoFactorEnabledServer ?? false
  const [logoutDialogStep, setLogoutDialogStep] = useState<
    'none' | 'pending' | 'wipe'
  >('none')
  const [pendingOperationsCount, setPendingOperationsCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const onClickLogout = () => {
    const operationsQueue = store.get(operationsQueueAtom) as unknown[]
    const pendingCount = operationsQueue?.length ?? 0
    setPendingOperationsCount(pendingCount)
    setLogoutDialogStep(pendingCount > 0 ? 'pending' : 'wipe')
  }

  const onCancelLogout = () => {
    if (isLoggingOut) return
    setLogoutDialogStep('none')
  }

  const onProceedAfterPendingWarning = () => {
    setLogoutDialogStep('wipe')
  }

  const onConfirmLogoutWithLoading = async () => {
    setIsLoggingOut(true)
    store.set(isLoggingOutAtom, true)
    // Navigate to home first — this unmounts the entire /data subtree
    // (including all PGlite consumers), releasing open IDB connections
    // so deleteDatabase can succeed without a hard reload
    navigate({ to: '/' })
    await clearLocalSyncedData()
    await signOut()
    store.set(isLoggingOutAtom, false)
  }

  return (
    <>
      <FluentMenu positioning="below-end">
        <Tooltip
          content={intl.formatMessage(
            { defaultMessage: '{email}' },
            { email: authUser?.email ?? '' },
          )}
        >
          <MenuTrigger disableButtonEnhancement>
            <Button
              size="medium"
              className={buttonClassName}
              aria-label={intl.formatMessage({
                id: 'userMenuOpen',
                defaultMessage: 'Benutzermenü öffnen',
              })}
              icon={
                <Avatar
                  size={24}
                  name={authUser?.fullName ?? authUser?.email ?? 'User'}
                />
              }
            />
          </MenuTrigger>
        </Tooltip>
        <MenuPopover>
          <MenuList>
            <div
              style={{
                padding: '8px 8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#424242',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              {authUser?.email}
            </div>
            <MenuItem
              icon={<MdLock />}
              onClick={() => setChangePasswordOpen(true)}
            >
              {hasPassword ? (
                <FormattedMessage
                  id="changePasswordMenuItem"
                  defaultMessage="Passwort ändern"
                />
              ) : (
                <FormattedMessage
                  id="setPasswordMenuItem"
                  defaultMessage="Passwort setzen"
                />
              )}
            </MenuItem>
            {hasPassword && (
              <MenuItem
                icon={<MdVerifiedUser />}
                onClick={() => setTwoFactorOpen(true)}
              >
                {twoFactorEnabled ? (
                  <FormattedMessage
                    id="twoFactorDisableMenuItem"
                    defaultMessage="2FA deaktivieren"
                  />
                ) : (
                  <FormattedMessage
                    id="twoFactorEnableMenuItem"
                    defaultMessage="2FA aktivieren"
                  />
                )}
              </MenuItem>
            )}
            <MenuItem
              icon={<MdFingerprint />}
              onClick={() => setPasskeyOpen(true)}
            >
              <FormattedMessage
                id="passkeyAddMenuItem"
                defaultMessage="Passkey hinzufügen"
              />
            </MenuItem>
            <MenuItem icon={<MdLogout />} onClick={onClickLogout}>
              <FormattedMessage id="logoutMenuItem" defaultMessage="Abmelden" />
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </FluentMenu>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        hasPassword={hasPassword}
        onPasswordSet={() => {
          setHasPasswordServer(true)
          setTwoFactorEnabledServer(false)
        }}
      />

      <PasskeyDialog open={passkeyOpen} onClose={() => setPasskeyOpen(false)} />

      <TwoFactorDialog
        open={twoFactorOpen}
        onClose={() => setTwoFactorOpen(false)}
        hasPassword={hasPassword}
        twoFactorEnabled={twoFactorEnabled}
        onChanged={(enabled) => {
          setTwoFactorEnabledServer(enabled)
        }}
      />

      <LogoutDialogs
        dialogStep={logoutDialogStep}
        pendingOperationsCount={pendingOperationsCount}
        isLoggingOut={isLoggingOut}
        onCancel={onCancelLogout}
        onProceedAfterPendingWarning={onProceedAfterPendingWarning}
        onConfirmLogout={onConfirmLogoutWithLoading}
      />
    </>
  )
}
