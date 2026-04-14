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
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { store, postgrestClientAtom } from '../../store.ts'
import { clearLocalSyncedData } from '../../modules/clearLocalSyncedData.ts'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
}

export const DeleteAccountDialog = ({ open, onClose, userId }: Props) => {
  const intl = useIntl()
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClose = () => {
    if (isDeleting) return
    setError('')
    onClose()
  }

  const onConfirm = async () => {
    setError('')
    setIsDeleting(true)
    const postgrestClient = store.get(postgrestClientAtom) as {
      from: (table: string) => {
        delete: () => {
          eq: (
            col: string,
            val: string,
          ) => Promise<{ error: { message: string } | null }>
        }
      }
    } | null
    if (!postgrestClient) {
      setError(
        intl.formatMessage({
          id: 'deleteAccountFailed',
          defaultMessage: 'Konto konnte nicht gelöscht werden.',
        }),
      )
      setIsDeleting(false)
      return
    }
    try {
      const { error: deleteError } = await postgrestClient
        .from('users')
        .delete()
        .eq('user_id', userId)
      if (deleteError) throw new Error(deleteError.message)
    } catch (e) {
      setError(
        (e as Error)?.message ??
          intl.formatMessage({
            id: 'deleteAccountFailed',
            defaultMessage: 'Konto konnte nicht gelöscht werden.',
          }),
      )
      setIsDeleting(false)
      return
    }
    await clearLocalSyncedData()
    window.location.assign('/')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) handleClose()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <FormattedMessage
              id="deleteAccountTitle"
              defaultMessage="Konto löschen"
            />
          </DialogTitle>
          <DialogContent>
            <p>
              <FormattedMessage
                id="deleteAccountWarning"
                defaultMessage="Das Löschen Ihres Kontos entfernt alle Ihre Daten dauerhaft und kann nicht rückgängig gemacht werden."
              />
            </p>
            <p>
              <FormattedMessage
                id="deleteAccountExportHint"
                defaultMessage="Wenn Sie Ihre Daten behalten möchten, exportieren Sie diese bitte zuerst."
              />
            </p>
            {error && (
              <p style={{ color: 'var(--colorStatusDangerForeground1)' }}>
                {error}
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={handleClose}
              disabled={isDeleting}
            >
              <FormattedMessage
                id="deleteAccountCancelBtn"
                defaultMessage="Abbrechen"
              />
            </Button>
            <Button
              appearance="primary"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <FormattedMessage
                  id="deleteAccountPleaseWait"
                  defaultMessage="Bitte warten..."
                />
              ) : (
                <FormattedMessage
                  id="deleteAccountConfirmBtn"
                  defaultMessage="Konto dauerhaft löschen"
                />
              )}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
