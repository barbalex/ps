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
import { useState } from 'react'
import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { MdLock, MdLogout, MdVerifiedUser } from 'react-icons/md'

import { getAuthBaseUrl } from '../../../../modules/authClient.ts'
import { operationsQueueAtom, store } from '../../../../store.ts'
import { ChangePasswordDialog } from './ChangePasswordDialog.tsx'
import { LogoutDialogs } from './LogoutDialogs.tsx'
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
  onConfirmLogout: () => Promise<void>
}

export const UserMenu = ({
  authUser,
  session,
  buttonClassName,
  onConfirmLogout,
}: Props) => {
  const intl = useIntl()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)
  const [twoFactorEnabledOverride, setTwoFactorEnabledOverride] = useState<
    boolean | undefined
  >(undefined)
  const [twoFactorEnabledServer, setTwoFactorEnabledServer] = useState<
    boolean | undefined
  >(undefined)
  const [hasPasswordServer, setHasPasswordServer] = useState<boolean | undefined>(
    undefined,
  )
  const [hasPasswordOverride, setHasPasswordOverride] = useState(false)
  const hasPasswordFromSession =
    session?.user?.accounts?.some((account) => {
      const provider = account.provider
      const providerId = (account as { providerId?: string }).providerId
      return provider === 'credential' || providerId === 'credential'
    }) ?? false
  const hasPassword =
    hasPasswordOverride || hasPasswordServer || hasPasswordFromSession
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
        const response = await fetch(`${getAuthBaseUrl()}/auth/two-factor/status`, {
          method: 'GET',
          credentials: 'include',
        })
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

  const twoFactorEnabledFromSession = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled,
  )
  const twoFactorEnabled =
    twoFactorEnabledOverride ?? twoFactorEnabledServer ?? twoFactorEnabledFromSession
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
    try {
      await onConfirmLogout()
    } finally {
      setIsLoggingOut(false)
      setLogoutDialogStep('none')
    }
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
            <MenuItem icon={<MdLogout />} onClick={onClickLogout}>
              <FormattedMessage defaultMessage="Abmelden" />
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </FluentMenu>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        hasPassword={hasPassword}
        onPasswordSet={() => {
          setHasPasswordOverride(true)
          setHasPasswordServer(true)
          setTwoFactorEnabledOverride(false)
          setTwoFactorEnabledServer(false)
        }}
      />

      <TwoFactorDialog
        open={twoFactorOpen}
        onClose={() => setTwoFactorOpen(false)}
        hasPassword={hasPassword}
        twoFactorEnabled={twoFactorEnabled}
        onChanged={(enabled) => {
          setTwoFactorEnabledOverride(enabled)
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
