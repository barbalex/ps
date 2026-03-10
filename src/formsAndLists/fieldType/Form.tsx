import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

export const FieldTypeForm = ({ onChange, validations, row, autoFocusRef }) => {
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
        label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortier-Reihenfolge' })}
        name="sort"
        value={row.sort ?? ''}
        onChange={onChange}
        validationState={validations?.sort?.state}
        validationMessage={validations?.sort?.message}
      />
      <TextField
        label={formatMessage({ id: 'Rm4jTs', defaultMessage: 'Bemerkungen' })}
        name="comment"
        value={row.comment ?? ''}
        onChange={onChange}
        validationState={validations?.comment?.state}
        validationMessage={validations?.comment?.message}
      />
    </>
  )
}
