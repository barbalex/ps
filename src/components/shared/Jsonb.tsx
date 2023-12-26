// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback, useState, useEffect } from 'react'
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
  textarea: ({ label, name, value, onChange }) => (
    <TextField label={label} name={name} value={value} onChange={onChange} />
  ),
  dropdown: ({ name, value, onChange }) => (
    <DropdownField name={name} value={value} onChange={onChange} />
  ),
  dropdownSimpleOptions: ({ name, value, onChange }) => (
    <DropdownFieldSimpleOptions name={name} value={value} onChange={onChange} />
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

export const Jsonb = ({
  table,
  name: jsonFieldName = 'data',
  idField,
  id,
  data = {},
}) => {
  const { project_id } = useParams()

  const { db } = useElectric()
  const { results: fields = [], error } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, project_id, deleted: false },
      // include: { widget_types: true }, // errors
    }),
  )

  const [fieldsWithRefs, setFieldsWithRefs] = useState([])
  useEffect(() => {
    const fieldsWithRefs = []
    for (const field of fields) {
      db.widget_types
        .findUnique({
          where: { widget_type_id: field.widget_type_id },
        })
        .then((widgetType) => {
          db.field_types
            .findUnique({ where: { field_type_id: field.field_type_id } })
            .then((fieldType) => {
              fieldsWithRefs.push({ ...field, fieldType, widgetType })
              setFieldsWithRefs(fieldsWithRefs)
            })
        })
    }
  }, [db.field_types, db.widget_types, fields])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const val = { ...data, [name]: value }
      console.log('Jsonb, onChange', { name, value, jsonFieldName, val, data })
      // db[table].update({
      //   where: { [idField]: id },
      //   data: { [jsonFieldName]: val },
      // })
    },
    [jsonFieldName],
  )

  // console.log('Jsonb, fields 1', {
  //   table,
  //   idField,
  //   id,
  //   data,
  //   error,
  //   fieldsWithRefs,
  // })

  return fieldsWithRefs.map((field) => {
    console.log('Jsonb, fieldWithRefs 1', field)
    const { name, field_label, fieldType, widgetType } = field
    const Widget = widget?.[widgetType?.name]
    console.log('Jsonb, fieldWithRefs 2', {
      name,
      field_label,
      Widget,
      fieldType,
    })

    return (
      <Widget
        key={name}
        label={field_label}
        name={name}
        type={fieldType?.name === 'integer' ? 'number' : fieldType?.name}
        value={data?.[name] ?? ''}
        onChange={onChange}
      />
    )
  })
}
