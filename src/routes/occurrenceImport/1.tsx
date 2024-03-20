import { memo } from 'react'

import { TextField } from '../../components/shared/TextField'
import { TextArea } from '../../components/shared/TextArea'
import { UploadButton } from '../../components/shared/UploadButton'
import { processData } from './processData'

export const One = memo(({ row, onChange, autoFocusRef }) => {
  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <>
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <TextArea
        label="Attribution"
        name="attribution"
        value={row.attribution ?? ''}
        onChange={onChange}
      />
      {/* TODO: only show when not yet uploaded? */}
      <UploadButton processData={processData} />
    </>
  )
})
