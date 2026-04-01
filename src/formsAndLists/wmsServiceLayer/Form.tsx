import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import type WmsServiceLayers from '../../models/public/WmsServiceLayers.ts'

import '../../form.css'

type WmsServiceLayerFormProps = {
  row: WmsServiceLayers
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data: unknown) => void
  validations?: Record<string, { state?: string; message?: string } | undefined>
}

export const WmsServiceLayerForm = ({
  row,
  onChange,
  validations,
}: WmsServiceLayerFormProps) => {
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
      <SwitchField
        label={formatMessage({ id: 'No2PqR', defaultMessage: 'Abfragbar' })}
        name="queryable"
        value={row.queryable ?? false}
        onChange={onChange}
        validationMessage={validations?.queryable?.message}
        validationState={validations?.queryable?.state}
      />
      <TextField
        label={formatMessage({ id: 'Op3QrS', defaultMessage: 'Legende URL' })}
        name="legend_url"
        value={row.legend_url ?? ''}
        onChange={onChange}
        validationMessage={validations?.legend_url?.message}
        validationState={validations?.legend_url?.state}
      />
    </>
  )
}
