import { useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { DropdownField } from '../../components/shared/DropdownField'


import '../../form.css'

export const WidgetType = ({ onChange, value }) => {
  const { db } = useElectric()

  const { results: widgetsForFieldResults = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      where: { field_type_id: value },
    }),
  )
  const widgetWhere = useMemo(
    () => ({
      widget_type_id: {
        in: widgetsForFieldResults?.map(({ widget_type_id }) => widget_type_id),
      },
    }),
    [widgetsForFieldResults],
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
}
