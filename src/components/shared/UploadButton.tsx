import { useCallback, useRef, useState, memo } from 'react'
import { Button, Field } from '@fluentui/react-components'

const uploadInputStyle = {
  display: 'none',
}

export const UploadButton = memo(({ processData }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      processData(file)
    },
    [processData],
  )

  const onClickUploadButton = useCallback(
    () => uploadInputRef.current?.click(),
    [],
  )

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
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      setIsDragging(false)
      const dt = e.dataTransfer
      const file = dt.files?.[0]
      processData(file)
    },
    [processData],
  )

  return (
    <Field
      validationMessage="Click to choose or drop a file. Accepts .csv, .json, .tsv, .xlsx, .xls, .ods."
      validationState="none"
    >
      <input
        label="Upload"
        type="file"
        onChange={onUpload}
        accept=".csv, .tsv, .xlsx, .xlsm, .xls, .ods, .fods, .dbf, .rtf, .txt, .dif"
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
