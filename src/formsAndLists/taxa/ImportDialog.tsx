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

import styles from '../listValues/ImportDialog.module.css'

interface Props {
  open: boolean
  onClose: () => void
  onFileSelected: (file: File) => void
}

export const ImportDialog = ({ open, onClose, onFileSelected }: Props) => {
  const { formatMessage } = useIntl()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    onFileSelected(file)
    onClose()
  }

  const onClickDropZone = () => {
    fileInputRef.current.click()
    fileInputRef.current.value = null
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
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
              id: 'tImportTitle',
              defaultMessage: 'Taxa importieren',
            })}
          </DialogTitle>
          <DialogContent>
            <p className={styles.description}>
              {formatMessage({
                id: 'tImportDesc',
                defaultMessage:
                  'Die Datei soll eine oder mehrere Spalten enthalten. Pflichtkolonne: name. Optionale Spalten: id_in_source, url.',
              })}
            </p>
            <p className={styles.description}>
              {formatMessage({
                id: 'tImportFormats',
                defaultMessage:
                  'Unterstützte Formate: .csv, .tsv, .xlsx, .xls, .ods',
              })}
            </p>
            <input
              type="file"
              accept=".csv,.tsv,.xlsx,.xls,.ods"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onInputChange}
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
                id: 'tImportDrop',
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
