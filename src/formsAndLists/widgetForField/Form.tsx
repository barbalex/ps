import { useIntl } from 'react-intl'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import type WidgetsForFields from '../../models/public/WidgetsForFields.ts'

import '../../form.css'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

export const WidgetForFieldForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
}: {
  onChange: FieldChangeHandler
  validations?: Record<string, { state: 'error'; message: string }>
  row: WidgetsForFields | Record<string, never>
  autoFocusRef?: React.Ref<HTMLInputElement>
  from?: string
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
