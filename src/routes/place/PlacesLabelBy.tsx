import { useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'

import '../../form.css'

export const PlacesLabelBy = memo(({ onChange, value }) => {
  const { db } = useElectric()
  const { project_id } = useParams()

  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: {
        table_name: 'places',
        project_id,
        deleted: false,
      },
    }),
  )
  const fieldNames = useMemo(() => fields?.map(({ name }) => name), [fields])

  return (
    <DropdownFieldSimpleOptions
      label="Places labeled by"
      name="places_label_by"
      value={value}
      onChange={onChange}
      options={fieldNames}
    />
  )
})
