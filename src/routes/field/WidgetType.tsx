import { useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import { DropdownField } from '../../components/shared/DropdownField.tsx'

import '../../form.css'

export const WidgetType = memo(({ onChange, field_type_id = '', value }) => {
  const db = usePGlite()

  const { results = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { field_type_id },
    }),
  )
  const widgetWhere = useMemo(
    () =>
      `widget_type_id in('${results
        ?.map(({ widget_type_id }) => widget_type_id)
        .join("','")}')`,
    [results],
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
