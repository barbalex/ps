import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import type Taxa from '../../models/public/Taxa.ts'

import '../../form.css'

type Props = {
  row: Taxa
  onChange: (e: React.ChangeEvent<unknown>, data?: unknown) => Promise<void>
  validations?: Record<string, { state: string; message: string }>
  autoFocusRef?: React.Ref<HTMLInputElement>
}

export const TaxonForm = ({
  row,
  onChange,
  validations,
  autoFocusRef,
}: Props) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextField
        label={formatMessage({ id: 'Fi9JkL', defaultMessage: 'ID in Quelle' })}
        name="id_in_source"
        value={row.id_in_source ?? ''}
        onChange={onChange}
        validationState={validations?.id_in_source?.state}
        validationMessage={validations?.id_in_source?.message}
      />
      <TextField
        label={formatMessage({ id: 'TpzCEx', defaultMessage: 'Url' })}
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
        validationState={validations?.url?.state}
        validationMessage={validations?.url?.message}
      />
    </>
  )
}
