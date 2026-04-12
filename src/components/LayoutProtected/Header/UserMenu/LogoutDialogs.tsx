import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} = fluentUiReactComponents
import { FormattedMessage, useIntl } from 'react-intl'

type Props = {
  dialogStep: 'none' | 'pending' | 'wipe'
  pendingOperationsCount: number
  isLoggingOut: boolean
  onCancel: () => void
  onProceedAfterPendingWarning: () => void
  onConfirmLogout: () => void
}

export const LogoutDialogs = ({
  dialogStep,
  pendingOperationsCount,
  isLoggingOut,
  onCancel,
  onProceedAfterPendingWarning,
  onConfirmLogout,
}: Props) => {
  const intl = useIntl()

  return (
    <>
      <Dialog open={dialogStep === 'pending'} onOpenChange={onCancel}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {intl.formatMessage({
                id: 'logoutPendingOpsTitle',
                defaultMessage: 'Achtung: Ausstehende Operationen',
              })}
            </DialogTitle>
            <DialogContent>
              {intl.formatMessage(
                {
                  id: 'logoutPendingOpsBody',
                  defaultMessage:
                    'Es sind noch {count} ausstehende lokale Operationen vorhanden. Wenn Sie sich jetzt abmelden, werden diese lokalen Daten gelöscht und können nicht mehr synchronisiert werden. Empfehlung: Warten Sie, bis alle Operationen mit dem Server synchronisiert wurden.',
                },
                { count: pendingOperationsCount },
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onCancel}>
                <FormattedMessage
                  id="logoutCancelBtn"
                  defaultMessage="Abbrechen"
                />
              </Button>
              <Button appearance="primary" onClick={onProceedAfterPendingWarning}>
                <FormattedMessage
                  id="logoutProceedAnywayBtn"
                  defaultMessage="Trotzdem fortfahren"
                />
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={dialogStep === 'wipe'} onOpenChange={onCancel}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <FormattedMessage
                id="logoutConfirmTitle"
                defaultMessage="Abmeldung bestätigen"
              />
            </DialogTitle>
            <DialogContent>
              {intl.formatMessage({
                id: 'logoutLocalDataWipeConfirm',
                defaultMessage:
                  'Beim Abmelden werden lokale Daten auf diesem Gerät gelöscht, damit der nächste Benutzer keine alten (= Ihre) Daten sieht. Ihre Daten wurden auf den Server synchronisiert. Daher gehen sie nicht verloren und werden bei Ihrer nächsten Anmeldung wieder verfügbar.\n\nJetzt abmelden?',
              })}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={onCancel}
                disabled={isLoggingOut}
              >
                <FormattedMessage
                  id="logoutCancelBtn"
                  defaultMessage="Abbrechen"
                />
              </Button>
              <Button
                appearance="primary"
                onClick={onConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <FormattedMessage
                    id="logoutPleaseWait"
                    defaultMessage="Bitte warten..."
                  />
                ) : (
                  <FormattedMessage
                    id="logoutNowBtn"
                    defaultMessage="Jetzt abmelden"
                  />
                )}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}