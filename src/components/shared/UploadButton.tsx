import { useCallback, useRef } from 'react'
import { Button } from '@fluentui/react-components'

const uploadInputStyle = {
  display: 'none',
}

export const UploadButton = () => {
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const onUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    console.log('file', file)
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result
      if (typeof content !== 'string') {
        return
      }
      console.log('content', content)
      // TODO: do something with the content
    }
    reader.readAsText(file)
  }, [])

  const onClickUploadButton = useCallback(
    () => uploadInputRef.current?.click(),
    [],
  )

  const onDragEnter = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('drag enter')
  }, [])
  const onDragOver = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('drag over')
  }, [])
  const onDrop = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('drop')
    const dt = e.dataTransfer
    const files = dt.files
    if (files.length === 0) {
      return
    }
  }, [])

  return (
    <>
      <input
        label="Upload"
        type="file"
        onChange={onUpload}
        accept=".csv, .json, .tsv, .xlsx, .xls, .ods"
        ref={uploadInputRef}
        style={uploadInputStyle}
      />
      <Button
        onClick={onClickUploadButton}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
      >
        Upload Import File
      </Button>
    </>
  )
}
