import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const WmsServiceForm = ({ row }) => {
  return (
    <>
      <TextField
        label="URL"
        name="url"
        value={row.url ?? ''}
        readOnly
      />
      <TextField
        label="Version"
        name="version"
        value={row.version ?? ''}
        readOnly
      />
      <TextField
        label="Image Format"
        name="image_format"
        value={row.image_format ?? ''}
        readOnly
      />
      <TextField
        label="Info Format"
        name="info_format"
        value={row.info_format ?? ''}
        readOnly
      />
      <TextField
        label="Default CRS"
        name="default_crs"
        value={row.default_crs ?? ''}
        readOnly
      />
    </>
  )
}
