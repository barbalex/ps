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
    include = {},
    labelFromResult,
    filter,
  }) => {
    const { db } = useElectric()!
    const { results = [] } = useLiveQuery(
      db[table]?.liveMany({
        where: {
          ...where,
          ...(filter && { label: { contains: filter } }),
        },
        orderBy,
        include,
      }),
    )
    // labelFromResult allows passing in special data. Not in use yet.
    const options = results.map((o) => ({
      // catch cases where the label is not present
      text:
        (labelFromResult ? labelFromResult(o) : o.label) ?? o[idField ?? name],
      value: o[idField ?? name],
    }))

    // console.log('hello FilteringComboboxOptions', {
    //   name,
    //   table,
    //   where,
    //   orderBy,
    //   include,
    //   filter,
    //   options,
    //   results,
    // })

    if (!options.length) {
      return (
        <Option
          key={0}
          value={0}
        >{`No ${table} found containing "${filter}".`}</Option>
      )
    }

    return options.map(({ text, value }) => (
      <Option key={value} value={value}>
        {text}
      </Option>
    ))
  },
)
