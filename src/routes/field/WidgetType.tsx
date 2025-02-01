import { useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetType = memo(({ onChange, field_type_id = '', value }) => {
  const result = useLiveQuery(
    `SELECT * FROM widgets_for_fields WHERE field_type_id = $1`,
    [field_type_id],
  )
  const widgetsForFields = useMemo(() => result?.rows ?? [], [result])
  const widgetWhere = useMemo(
    () =>
      `widget_type_id in('${widgetsForFields
        ?.map(({ widget_type_id }) => widget_type_id)
        .join("','")}')`,
    [widgetsForFields],
  )

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
})
