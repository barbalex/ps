import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import type WfsServiceLayers from '../../models/public/WfsServiceLayers.ts'

import '../../form.css'

type WfsServiceLayerFormProps = {
  row: WfsServiceLayers
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data: unknown) => void
  validations?: Record<string, { state?: string; message?: string } | undefined>
}

export const WfsServiceLayerForm = ({
  row,
  onChange,
  validations,
}: WfsServiceLayerFormProps) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        validationMessage={validations?.name?.message}
        validationState={validations?.name?.state}
      />
      <TextField
        label={formatMessage({ id: 'Fl3jPw', defaultMessage: 'Bezeichnung' })}
        name="label"
        value={row.label ?? ''}
        onChange={onChange}
        validationMessage={validations?.label?.message}
        validationState={validations?.label?.state}
      />
    </>
  )
}
