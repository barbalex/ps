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
      <Button onClick={onClickUploadButton}>Upload File</Button>
    </>
  )
}
