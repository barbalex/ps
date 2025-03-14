import { memo } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
// TODO: get working from filter
export const Component = memo(({ onChange, row, autoFocusRef }) => {
  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <SwitchField
        label="Needs a list"
        name="needs_list"
        value={row.needs_list ?? false}
        onChange={onChange}
      />
      <TextField
        label="Sort value"
        name="sort"
        value={row.sort ?? ''}
        type="number"
        onChange={onChange}
      />
      <TextField
        label="Comment"
        name="comment"
        value={row.comment ?? ''}
        onChange={onChange}
      />
    </>
  )
})
