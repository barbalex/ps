import { useRef, useState, useEffect } from 'react'
import { Button, Field } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import styles from './UploadButton.module.css'

export const UploadButton = ({ processData, additionalData = {} }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      const result = await processData({ file, additionalData, db })
      if (result?.success) {
        setSuccessMessage(result.message || 'File uploaded successfully')
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to process file')
    }
  }

  const onClickUploadButton = () => {
    uploadInputRef.current.click()
    // need to set the value to null to allow uploading more files
    uploadInputRef.current.value = null
  }

  const onDragEnter = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(false)
  }

  // onDragOver is needed to prevent the browser from asking the user to save file as
  const onDragOver = (e) => {
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
      const result = await processData({ file, additionalData, db })
      if (result?.success) {
        setSuccessMessage(result.message || 'File uploaded successfully')
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to process file')
    }
  }

  return (
    <Field
      validationMessage={
        errorMessage ?
          <span style={{ color: 'rgb(196, 49, 75)' }}>{errorMessage}</span>
        : 'Click to choose or drop a file. Accepts .csv, .tsv, .xlsx, .xls, .ods, .txt.'
      }
      validationState={errorMessage ? 'error' : 'none'}
    >
      <input
        label="Upload"
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
        style={{
          backgroundColor:
            isDragging ? 'rgba(103, 216, 101, 0.2)' : 'transparent',
          color: successMessage ? 'rgba(38, 82, 37, 0.9)' : undefined,
        }}
        className={styles.button}
      >
        {successMessage || 'Upload file containing occurrences'}
      </Button>
    </Field>
  )
}
