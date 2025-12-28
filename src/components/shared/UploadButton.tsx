import { useRef, useState } from 'react'
import { Button, Field } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import styles from './UploadButton.module.css'

export const UploadButton = ({ processData, additionalData = {} }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const db = usePGlite()

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processData({ file, additionalData, db })
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
    const dt = e.dataTransfer
    const file = dt.files?.[0]
    await processData({ file, additionalData, db })
  }

  return (
    <Field
      validationMessage="Click to choose or drop a file. Accepts .csv, .tsv, .xlsx, .xls, .ods, .txt."
      validationState="none"
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
          backgroundColor: isDragging
            ? 'rgba(103, 216, 101, 0.2)'
            : 'transparent',
        }}
        className={styles.button}
      >
        Upload file containing occurrences
      </Button>
    </Field>
  )
}
