import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
// TODO: get working from filter
export const WidgetTypeForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
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
        validationMessage={validations?.name?.message}
        validationState={validations?.name?.state}
      />
      <SwitchField
        label={formatMessage({ id: 'NdL8pA', defaultMessage: 'Ben\u00f6tigt eine Liste' })}
        name="needs_list"
        value={row.needs_list ?? false}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortier-Reihenfolge' })}
        name="sort"
        value={row.sort ?? ''}
        type="number"
        onChange={onChange}
        validationMessage={validations?.sort?.message}
        validationState={validations?.sort?.state}
      />
      <TextField
        label={formatMessage({ id: 'Rm4jTs', defaultMessage: 'Bemerkungen' })}
        name="comment"
        value={row.comment ?? ''}
        onChange={onChange}
        validationMessage={validations?.comment?.message}
        validationState={validations?.comment?.state}
      />
    </>
  )
}
