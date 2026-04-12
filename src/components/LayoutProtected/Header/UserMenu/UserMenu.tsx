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
import { FormattedMessage, useIntl } from 'react-intl'
import { MdLock, MdLogout } from 'react-icons/md'

import { operationsQueueAtom, store } from '../../../../store.ts'
import { ChangePasswordDialog } from './ChangePasswordDialog.tsx'
import { LogoutDialogs } from './LogoutDialogs.tsx'

type AuthUser = {
  email?: string
  fullName?: string
}

type Props = {
  authUser: AuthUser | null | undefined
  buttonClassName: string
  onConfirmLogout: () => Promise<void>
}

export const UserMenu = ({ authUser, buttonClassName, onConfirmLogout }: Props) => {
  const intl = useIntl()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
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
            <MenuItem icon={<MdLock />} onClick={() => setChangePasswordOpen(true)}>
              <FormattedMessage
                id="changePasswordMenuItem"
                defaultMessage="Passwort ändern"
              />
            </MenuItem>
            <MenuItem icon={<MdLogout />} onClick={onClickLogout}>
              <FormattedMessage defaultMessage="Abmelden" />
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </FluentMenu>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
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