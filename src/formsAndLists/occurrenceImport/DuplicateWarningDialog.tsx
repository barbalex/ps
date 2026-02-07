import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
} from '@fluentui/react-components'

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
}: DuplicateWarningDialogProps) => (
  <Dialog open={open}>
    <DialogSurface>
      <DialogTitle>Duplicate Data Detected</DialogTitle>
      <DialogContent>
        <DialogBody>
          <div className={styles.warning}>
            <p>
              <strong>Warning:</strong> {duplicateCount} of {totalCount} row
              {duplicateCount !== 1 ? 's' : ''} appear
              {duplicateCount === 1 ? 's' : ''} to already exist in the
              database (exact match on all data fields).
            </p>
            <p>Do you want to proceed with the import anyway?</p>
          </div>
        </DialogBody>
      </DialogContent>
      <DialogActions>
        <Button appearance="secondary" onClick={onCancel}>
          Cancel Import
        </Button>
        <Button appearance="primary" onClick={onConfirm}>
          Proceed with Import
        </Button>
      </DialogActions>
    </DialogSurface>
  </Dialog>
)
