import * as fluentUiReactComponents from '@fluentui/react-components'
const { Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

export const FilteringComboboxOptions = ({
  name,
  table,
  idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
  filter,
}) => {
  const res = useLiveQuery(
    `
      SELECT * 
      FROM ${table}
      ${filter ? `WHERE label ilike '%${filter}%'` : ''} 
      ORDER BY label
      LIMIT 15`,
  )
  const rows = res?.rows ?? []
  const options = rows.map((o) => ({
    // catch cases where the label is not present
    text: o.label ?? o[idField ?? name],
    value: o[idField ?? name],
  }))

  // console.log('hello FilteringComboboxOptions', {
  //   name,
  //   table,
  //   filter,
  //   options,
  //   res,
  //   rows,
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
}
