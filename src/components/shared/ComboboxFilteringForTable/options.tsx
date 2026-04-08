import * as fluentUiReactComponents from '@fluentui/react-components'
const { Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

export const FilteringComboboxOptions = ({
  name,
  table,
  idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
  filter,
}) => {
  const idCol = idField ?? name
  const res = useLiveQuery(
    `
      SELECT label, ${idCol}
      FROM ${table}
      ${filter ? `WHERE label ilike '%${filter}%'` : ''} 
      ORDER BY label
      LIMIT 15`,
  )
  const rows = res?.rows ?? []
  const options = rows.map((o) => ({
    text: o.label ?? o[idCol],
    value: o[idCol],
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
