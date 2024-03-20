import { memo } from 'react'

import { TextField } from '../../components/shared/TextField'
import { TextArea } from '../../components/shared/TextArea'
import { UploadButton } from '../../components/shared/UploadButton'
import { processData } from './processData'

export const One = memo(({ occurrenceImport, onChange, autoFocusRef }) => {
  if (!occurrenceImport) {
    return <div>Loading...</div>
  }

  return (
    <>
      <TextField
        label="Name"
        name="name"
        type="name"
        value={occurrenceImport.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <TextArea
        label="Attribution"
        name="attribution"
        value={occurrenceImport.attribution ?? ''}
        onChange={onChange}
      />
      {/* TODO: only show when not yet uploaded? */}
      <UploadButton processData={processData} />
    </>
  )
})
