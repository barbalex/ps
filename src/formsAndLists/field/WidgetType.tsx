import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetType = ({
  onChange,
  validations = {},
  field_type_id = '',
  value,
}) => {
  const normalizedFieldTypeId =
    typeof field_type_id === 'string' ? field_type_id.trim() : field_type_id

  const widgetWhere = normalizedFieldTypeId ?
      `
    widget_type_id in (
      SELECT widget_type_id
      FROM widgets_for_fields
      WHERE field_type_id = '${normalizedFieldTypeId}'
    )
  `
    : '1 = 0'

  return (
    <DropdownField
      label="Widget"
      name="widget_type_id"
      table="widget_types"
      value={value ?? ''}
      where={widgetWhere}
      onChange={onChange}
      validationState={validations?.widget_type_id?.state ?? 'none'}
      validationMessage={
        validations.widget_type_id?.message ??
        (normalizedFieldTypeId ? undefined : 'Field type required')
      }
    />
  )
}
