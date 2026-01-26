import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetForFieldForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
}) => (
  <>
    <DropdownField
      label="Field type"
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
      label="Widget type"
      name="widget_type_id"
      table="widget_types"
      value={row.widget_type_id ?? ''}
      onChange={onChange}
      validationState={validations?.widget_type_id?.state}
      validationMessage={validations?.widget_type_id?.message}
    />
  </>
)
