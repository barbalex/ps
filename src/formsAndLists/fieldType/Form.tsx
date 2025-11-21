import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const FieldTypeForm = ({ onChange, row, autoFocusRef }) => (
  <>
    <TextField
      label="Name"
      name="name"
      value={row.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
    />
    <TextField
      label="Sort value"
      name="sort"
      value={row.sort ?? ''}
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
