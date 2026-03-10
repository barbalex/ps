import { useIntl } from 'react-intl'

import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetForFieldForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <DropdownField
        label={formatMessage({ id: 'LTiTmL', defaultMessage: 'Feld-Typ' })}
        name="field_type_id"
        table="field_types"
        value={row.field_type_id ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.field_type_id?.state}
        validationMessage={validations?.field_type_id?.message}
      />
      <DropdownField
        label={formatMessage({ id: '9oUdHT', defaultMessage: 'Widget-Typ' })}
        name="widget_type_id"
        table="widget_types"
        value={row.widget_type_id ?? ''}
        onChange={onChange}
        validationState={validations?.widget_type_id?.state}
        validationMessage={validations?.widget_type_id?.message}
      />
    </>
  )
}
