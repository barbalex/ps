import { useRef, useState } from 'react'
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

import styles from './ImportDumpDialog.module.css'

interface Props {
  open: boolean
  onClose: () => void
  onFileSelected: (file: File) => void
}

export const ImportDumpDialog = ({ open, onClose, onFileSelected }: Props) => {
  const { formatMessage } = useIntl()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    onFileSelected(file)
    onClose()
  }

  const onClickDropZone = () => {
    fileInputRef.current?.click()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {formatMessage({
              id: 'pdImportTitle',
              defaultMessage: 'Aus SQL-Dumpdatei importieren',
            })}
          </DialogTitle>
          <DialogContent>
            <p className={styles.description}>
              {formatMessage({
                id: 'pdImportDesc',
                defaultMessage:
                  'Die Datei muss ein mit dieser App exportierter Projekt-Dump sein (.sql). Das Projekt wird mit seinen ursprünglichen IDs auf den Server geladen und dem gewählten Konto zugeordnet. Zugriffsrechte werden nicht übernommen: Sie werden Eigentümer:in.',
              })}
            </p>
            <p className={styles.description}>
              {formatMessage({
                id: 'pdImportHint',
                defaultMessage:
                  'Ein Projekt mit derselben ID darf noch nicht existieren. Der Import benötigt eine Verbindung zum Server.',
              })}
            </p>
            <input
              type="file"
              accept=".sql"
              ref={fileInputRef}
              className={styles.hiddenInput}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
              onClick={onClickDropZone}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {formatMessage({
                id: 'lVImportDrop',
                defaultMessage: 'Datei hier ablegen oder klicken zum Auswählen',
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              {formatMessage({ id: 'ZSShqa', defaultMessage: 'Abbrechen' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
