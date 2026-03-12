import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

import '../../form.css'

export const WmsServiceLayerForm = ({ row }) => {
  const { formatMessage } = useIntl()
  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        readOnly
      />
      <TextField
        label={formatMessage({ id: 'Fl3jPw', defaultMessage: 'Bezeichnung' })}
        name="label"
        value={row.label ?? ''}
        readOnly
      />
      <SwitchField
        label={formatMessage({ id: 'No2PqR', defaultMessage: 'Abfragbar' })}
        name="queryable"
        value={row.queryable ?? false}
        readOnly
      />
      <TextField
        label={formatMessage({ id: 'Op3QrS', defaultMessage: 'Legende URL' })}
        name="legend_url"
        value={row.legend_url ?? ''}
        readOnly
      />
    </>
  )
}
