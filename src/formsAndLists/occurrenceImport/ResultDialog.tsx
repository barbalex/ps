import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
} from '@fluentui/react-components'

import styles from './ResultDialog.module.css'

interface ResultDialogProps {
  open: boolean
  title: string
  message: string
  isError?: boolean
  onClose: () => void
}

export const ResultDialog = ({
  open,
  title,
  message,
  isError = false,
  onClose,
}: ResultDialogProps) => (
  <Dialog open={open}>
    <DialogSurface>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogBody>
          <div className={isError ? styles.error : styles.success}>
            <p>{message}</p>
          </div>
        </DialogBody>
      </DialogContent>
      <DialogActions>
        <Button appearance="primary" onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </DialogSurface>
  </Dialog>
)
