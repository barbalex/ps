import { memo } from 'react'
import { Option } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'

export const FilteringComboboxOptions = memo(
  ({
    name,
    table,
    idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
    labelFromResult,
    filter,
  }) => {
    const result = useLiveQuery(
      `
      SELECT * 
      FROM ${table}
      ${filter ? ` WHERE label ilike '%${filter}%'` : ''} 
      ORDER BY label`,
      [filter],
    )
    const results = result?.rows ?? []
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
      <Option
        key={value}
        value={value}
      >
        {text}
      </Option>
    ))
  },
)
