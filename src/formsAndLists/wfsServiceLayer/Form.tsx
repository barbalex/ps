import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const WfsServiceLayerForm = ({ row }) => {
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
    </>
  )
}
