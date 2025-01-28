import { useCallback, useRef, useState, memo } from 'react'
import { Button, Field } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

const uploadInputStyle = {
  display: 'none',
}

export const UploadButton = memo(({ processData, additionalData = {} }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const db = usePGlite()

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      await processData({ file, additionalData, db })
    },
    [additionalData, db, processData],
  )

  const onClickUploadButton = useCallback(() => {
    uploadInputRef.current.click()
    // need to set the value to null to allow uploading more files
    uploadInputRef.current.value = null
  }, [])

  const onDragEnter = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const onDragLeave = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(false)
  }, [])
  // onDragOver is needed to prevent the browser from asking the user to save file as
  const onDragOver = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])
  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setIsDragging(false)
      const dt = e.dataTransfer
      const file = dt.files?.[0]
      await processData({ file, additionalData, db })
    },
    [additionalData, db, processData],
  )

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
        style={uploadInputStyle}
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
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      >
        Upload file containing occurrences
      </Button>
    </Field>
  )
})
