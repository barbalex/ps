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
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import styles from './ImportDialog.module.css'

interface Props {
  open: boolean
  listId: string
  onClose: () => void
  onFileSelected: (file: File, valueType: string | undefined) => void
}

const VALUE_TYPE_MESSAGE_IDS: Record<string, string> = {
  integer: 'lVTypeInteger',
  numeric: 'lVTypeNumeric',
  text: 'lVTypeText',
  date: 'lVTypeDate',
  datetime: 'lVTypeDatetime',
}

const VALUE_TYPE_DEFAULTS: Record<string, string> = {
  integer: 'Ganzzahl (z.B. 1, 2, 3)',
  numeric: 'Dezimalzahl (z.B. 1.5, 2.75)',
  text: 'Text',
  date: 'Datum (YYYY-MM-DD)',
  datetime: 'Datum und Uhrzeit (ISO 8601)',
}

export const ImportDialog = ({
  open,
  listId,
  onClose,
  onFileSelected,
}: Props) => {
  const { formatMessage } = useIntl()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const res = useLiveQuery(`SELECT value_type FROM lists WHERE list_id = $1`, [
    listId,
  ])
  const valueType: string | undefined = res?.rows?.[0]?.value_type

  const handleFile = (file: File | undefined) => {
    if (!file) return
    onFileSelected(file, valueType)
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

  const typeLabel = valueType
    ? formatMessage({
        id: VALUE_TYPE_MESSAGE_IDS[valueType] ?? valueType,
        defaultMessage: VALUE_TYPE_DEFAULTS[valueType] ?? valueType,
      })
    : '?'

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
              id: 'lVImportTitle',
              defaultMessage: 'Werte importieren',
            })}
          </DialogTitle>
          <DialogContent>
            <p className={styles.description}>
              {formatMessage(
                {
                  id: 'lVImportDesc',
                  defaultMessage:
                    'Die Datei soll eine einfache Liste von Werten enthalten – eine pro Zeile, ohne Spaltenüberschrift. Erwarteter Typ: {type}.',
                },
                { type: <strong>{typeLabel}</strong> },
              )}
            </p>
            <p className={styles.description}>
              {formatMessage({
                id: 'lVImportFormats',
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
