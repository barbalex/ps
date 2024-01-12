import { memo } from 'react'
import { Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'

export const FilteringComboboxOptions = memo(
  ({
    name,
    table,
    idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
    where = {},
    orderBy = { label: 'asc' },
    filter,
  }) => {
    const { db } = useElectric()
    const { results = [] } = useLiveQuery(
      db[table]?.liveMany({
        where: {
          ...where,
          label: { contains: filter },
        },
        orderBy,
      }),
    )
    const options = results.map((o) => ({
      text: o.label,
      value: o[idField ?? name],
    }))

    return options.map(({ text, value }) => (
      <Option key={value} value={value}>
        {text}
      </Option>
    ))
  },
)
