import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
} = fluentUiReactComponents
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { pendingRowDeleteAtom } from '../modules/deleteRow.ts'

// global confirmation for deletes whose cascade would take child rows with
// them (see modules/deleteRow.ts) — the pending delete resolves this
// dialog's confirm/cancel back into the originating swipe or form header
export const DeleteCascadeDialog: React.FC = () => {
  const pending = useAtomValue(pendingRowDeleteAtom)
  const setPending = useSetAtom(pendingRowDeleteAtom)
  const { formatMessage } = useIntl()

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed)
    setPending(null)
  }

  return (
    <Dialog
      open={!!pending}
      onOpenChange={(_, data) => {
        if (!data.open) close(false)
      }}
      modalType="modal"
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {formatMessage({
              id: 'deleteCascadeTitle',
              defaultMessage: 'Wirklich löschen?',
            })}
          </DialogTitle>
          <DialogContent>
            {pending &&
              formatMessage(
                {
                  id: 'deleteCascadeText',
                  defaultMessage:
                    '{name} löschen? Auch {count, plural, one {# untergeordneter Eintrag} other {# untergeordnete Einträge}} werden gelöscht.',
                },
                { name: pending.label, count: pending.childCount },
              )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => close(false)}>
              {formatMessage({
                id: 'deleteCascadeCancel',
                defaultMessage: 'Abbrechen',
              })}
            </Button>
            <Button appearance="primary" onClick={() => close(true)}>
              {formatMessage({
                id: 'deleteCascadeConfirm',
                defaultMessage: 'Löschen',
              })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
