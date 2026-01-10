import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const FieldTypeForm = ({ onChange, validations, row, autoFocusRef }) => (
  <>
    <TextField
      label="Name"
      name="name"
      value={row.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
      validationState={validations.name?.state}
      validationMessage={validations.name?.message}
    />
    <TextField
      label="Sort value"
      name="sort"
      value={row.sort ?? ''}
      onChange={onChange}
      validationState={validations.sort?.state}
      validationMessage={validations.sort?.message}
    />
    <TextField
      label="Comment"
      name="comment"
      value={row.comment ?? ''}
      onChange={onChange}
      validationState={validations.comment?.state}
      validationMessage={validations.comment?.message}
    />
  </>
)
