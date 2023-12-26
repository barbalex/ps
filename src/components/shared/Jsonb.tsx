// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { TextField } from './TextField'
import { DropdownField } from './DropdownField'
import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions'

const widget = {
  text: ({ label, name, value, onChange }) => (
    <TextField label={label} name={name} value={value} onChange={onChange} />
  ),
  textArea: ({ name, value, onChange }) => (
    <TextField label={label}  name={name} value={value} onChange={onChange} />
  ),
  dropdown: ({ name, value, onChange }) => (
    <DropdownField name={name} value={value} onChange={onChange} />
  ),
  dropdownSimpleOptions: ({ name, value, onChange }) => (
    <DropdownFieldSimpleOptions
      name={name}
      value={value}
      onChange={onChange}
    />
  ),
  // checkbox: ({ name, value, onChange }) => (
  //   <Checkbox name={name} checked={value} onChange={onChange} />
  // ),
  // radio: ({ name, value, onChange }) => (
  //   <RadioGroup name={name} value={value} onChange={onChange}>
  //     <Radio label="Yes" value="true" />
  //     <Radio label="No" value="false" />
  //   </RadioGroup>
  // ),
}

export const Jsonb = memo(({ table, idField, id, data }) => {
  const { project_id } = useParams()

  const { db } = useElectric()
  const { results: fields = [], error } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, project_id, deleted: false },
      include: { widget_types: true },
    }),
  )

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      console.log('Jsonb, onChange', { name, value })
      // db[table].update({
      //   where: { [idField]: id },
      //   data: { [name]: value },
      // })
    },
    [],
  )

  console.log('Jsonb, fields', { fields, table, idField, id, data, error })

  return fields.map((field) => {
    const { name, widget_type } = field
    const value = data[name]
    const Widget = widget[widget_type]

    return (
      <div key={name}>
        <label>{name}</label>
        <Widget
          name={name}
          value={value}
          onChange={onChange}
        />
      </div>
    )
  })
})
