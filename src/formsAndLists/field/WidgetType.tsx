import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetType = ({ onChange, field_type_id = '', value }) => {
  const widgetWhere = `
    widget_type_id in (
      SELECT widget_type_id
      FROM widgets_for_fields
      WHERE field_type_id = '${field_type_id}'
    )
  `

  return (
    <DropdownField
      label="Widget"
      name="widget_type_id"
      table="widget_types"
      value={value ?? ''}
      where={widgetWhere}
      onChange={onChange}
      validationMessage={field_type_id ? undefined : 'Field type required'}
      validationState={'none'}
    />
  )
}
