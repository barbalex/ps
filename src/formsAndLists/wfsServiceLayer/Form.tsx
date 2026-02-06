import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const WfsServiceLayerForm = ({ row }) => {
  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        readOnly
      />
      <TextField
        label="Title"
        name="title"
        value={row.title ?? ''}
        readOnly
      />
      <TextField
        label="Abstract"
        name="abstract"
        value={row.abstract ?? ''}
        readOnly
      />
      <TextField
        label="Label"
        name="label"
        value={row.label ?? ''}
        readOnly
      />
    </>
  )
}
