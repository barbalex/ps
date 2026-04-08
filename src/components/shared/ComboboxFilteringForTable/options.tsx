import * as fluentUiReactComponents from '@fluentui/react-components'
const { Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

export const FilteringComboboxOptions = ({
  name,
  table,
  idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
  labelFromResult,
  filter,
}) => {
  const normalizedFilter = (filter ?? '').trim()
  const limit = 100
  const res = useLiveQuery(
    `
      SELECT *
      FROM ${table}
      WHERE ($1 = '' OR label ILIKE ('%' || $1 || '%'))
      ORDER BY label
      LIMIT $2`,
    [normalizedFilter, limit],
  )
  const rows = res?.rows ?? []
  // labelFromResult allows passing in special data. Not in use yet.
  const options = rows.map((o) => ({
    // catch cases where the label is not present
    text:
      (labelFromResult ? labelFromResult(o) : o.label) ?? o[idField ?? name],
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
      >{`No ${table} found containing "${normalizedFilter}".`}</Option>
    )
  }

  return options.map(({ text, value }) => (
    <Option key={value} value={value}>
      {text}
    </Option>
  ))
}
