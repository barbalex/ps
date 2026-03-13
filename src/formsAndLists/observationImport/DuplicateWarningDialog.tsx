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
import { useIntl } from 'react-intl'

import styles from './DuplicateWarningDialog.module.css'

interface DuplicateWarningDialogProps {
  open: boolean
  duplicateCount: number
  totalCount: number
  onConfirm: () => void
  onCancel: () => void
}

export const DuplicateWarningDialog = ({
  open,
  duplicateCount,
  totalCount,
  onConfirm,
  onCancel,
}: DuplicateWarningDialogProps) => {
  const { formatMessage } = useIntl()
  return (
    <Dialog open={open}>
      <DialogSurface>
        <DialogTitle>
          {formatMessage({
            id: 'dupDtct',
            defaultMessage: 'Doppelte Daten erkannt',
          })}
        </DialogTitle>
        <DialogContent>
          <DialogBody>
            <div className={styles.warning}>
              <p>
                <strong>
                  {formatMessage({ id: 'dupWrg', defaultMessage: 'Warnung:' })}
                </strong>{' '}
                {formatMessage(
                  {
                    id: 'dupWrn',
                    defaultMessage:
                      '{duplicateCount} von {totalCount} Zeilen scheinen bereits in der Datenbank zu existieren (exakte Übereinstimmung bei allen Datenfeldern).',
                  },
                  { duplicateCount, totalCount },
                )}
              </p>
              <p>
                {formatMessage({
                  id: 'dupPrc',
                  defaultMessage:
                    'Möchten Sie mit dem Import trotzdem fortfahren?',
                })}
              </p>
            </div>
          </DialogBody>
        </DialogContent>
        <DialogActions>
          <Button appearance="secondary" onClick={onCancel}>
            {formatMessage({
              id: 'dupCnl',
              defaultMessage: 'Import abbrechen',
            })}
          </Button>
          <Button appearance="primary" onClick={onConfirm}>
            {formatMessage({
              id: 'dupCnt',
              defaultMessage: 'Import fortsetzen',
            })}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  )
}
