import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

import '../../form.css'

export const WmsServiceLayerForm = ({ row }) => {
  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        readOnly
      />
      <TextField
        label="Label"
        name="label"
        value={row.label ?? ''}
        readOnly
      />
      <SwitchField
        label="Queryable"
        name="queryable"
        value={row.queryable ?? false}
        readOnly
      />
      <TextField
        label="Legend URL"
        name="legend_url"
        value={row.legend_url ?? ''}
        readOnly
      />
    </>
  )
}
