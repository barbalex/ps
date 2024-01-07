import { useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { DropdownField } from '../../components/shared/DropdownField'

import '../../form.css'

export const WidgetType = memo(({ onChange, value }) => {
  const { db } = useElectric()

  const { results = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { field_type_id: value },
    }),
  )
  const widgetWhere = useMemo(
    () => ({
      widget_type_id: {
        in: results?.map(({ widget_type_id }) => widget_type_id),
      },
    }),
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
    />
  )
})
