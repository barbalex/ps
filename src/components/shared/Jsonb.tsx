// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useMemo, useCallback } from 'react'
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
  textarea: ({ name, value, onChange }) => (
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
  name: jsonFieldName,
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

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      console.log('Jsonb, onChange', { name, value })
      const val = { ...data, [name]: value }
      db[table].update({
        where: { [idField]: id },
        data: { [jsonFieldName]: val },
      })
    },
    [db, id, idField, jsonFieldName, table],
  )

  const fieldsWithRefs = useMemo(() => {
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
            })
        })
    }
    return fieldsWithRefs
  }, [db.field_types, db.widget_types, fields])

  console.log('Jsonb, fields 1', {
    table,
    idField,
    id,
    data,
    error,
    fieldsWithRefs,
  })

  return fieldsWithRefs.map((field) => {
    console.log('Jsonb, fieldWithRefs 1', field)
    const { name, field_label, widgetType } = field
    const Widget = widget?.[widgetType?.name]
    console.log('Jsonb, fieldWithRefs 2', {
      name,
      field_label,
      widgetType,
      widgetTypeName: widgetType?.name,
      Widget,
    })

    return (
      <Widget
        key={name}
        label={field_label}
        name={name}
        value={value}
        onChange={onChange}
      />
    )
  })
}
