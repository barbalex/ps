import { useRef, useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Field } = fluentUiReactComponents
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import styles from './UploadButton.module.css'

type Props = {
  processData: (args: {
    file?: File | undefined
    additionalData: Record<string, unknown>
    db: ReturnType<typeof usePGlite>
  }) => Promise<unknown> | unknown
  additionalData?: Record<string, unknown>
}

type ProcessDataResult = { success?: boolean; message?: string }

export const UploadButton = ({ processData, additionalData = {} }: Props) => {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { formatMessage } = useIntl()
  const uploadSuccessMessage = formatMessage({
    id: 'fIuPSu',
    defaultMessage: 'Datei erfolgreich hochgeladen',
  })
  const unexpectedErrorMessage = formatMessage({
    id: 'anUnEx',
    defaultMessage: 'Ein Fehler ist aufgetreten',
  })

  const db = usePGlite()

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setErrorMessage(null)
    try {
      const result = (await processData({
        file,
        additionalData,
        db,
      })) as ProcessDataResult | null | undefined
      if (result?.success) {
        setSuccessMessage(result.message || uploadSuccessMessage)
      }
    } catch (error) {
      setErrorMessage((error as Error).message || unexpectedErrorMessage)
    }
  }

  const onClickUploadButton = () => {
    uploadInputRef.current!.click()
    // need to set the value to null to allow uploading more files
    uploadInputRef.current!.value = null as unknown as string
  }

  const onDragEnter = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(false)
  }

  // onDragOver is needed to prevent the browser from asking the user to save file as
  const onDragOver = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const onDrop = async (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(false)
    setErrorMessage(null)
    const dt = e.dataTransfer
    const file = dt.files?.[0]
    try {
      const result = (await processData({
        file,
        additionalData,
        db,
      })) as ProcessDataResult | null | undefined
      if (result?.success) {
        setSuccessMessage(result.message || uploadSuccessMessage)
      }
    } catch (error) {
      setErrorMessage((error as Error).message || unexpectedErrorMessage)
    }
  }

  return (
    <Field
      validationMessage={
        errorMessage ? (
          <span className={styles.errorMessage}>{errorMessage}</span>
        ) : (
          formatMessage({
            id: 'cLcHDr',
            defaultMessage:
              'Klicken zum Auswählen oder Datei ablegen. Akzeptiert .csv, .tsv, .xlsx, .xls, .ods, .txt.',
          })
        )
      }
      validationState={errorMessage ? 'error' : 'none'}
    >
      <input
        // label is not a valid attribute for input but is passed through unchanged
        {...({ label: 'Upload' } as Record<string, string>)}
        type="file"
        onChange={onUpload}
        accept=".csv, .tsv, .xlsx, .xls, .ods, .txt"
        ref={uploadInputRef}
        className={styles.uploadInput}
      />
      <Button
        onClick={onClickUploadButton}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`${styles.button}${isDragging ? ` ${styles.buttonDragging}` : ''}${successMessage ? ` ${styles.buttonSuccess}` : ''}`}
      >
        {successMessage ||
          formatMessage({
            id: 'uPlBTx',
            defaultMessage: 'Datei mit Beobachtungen hochladen',
          })}
      </Button>
    </Field>
  )
}
