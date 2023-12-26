// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { TextField } from './TextField'
import { DropdownField } from './DropdownField'
import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions'

const widget = {
  text: ({ label, name, value, type, onChange }) => (
    <TextField
      label={label}
      name={name}
      value={value}
      type={type ?? 'text'}
      onChange={onChange}
    />
  ),
  textarea: ({ label, name, value, type, onChange }) => (
    <TextField
      label={label}
      name={name}
      value={value}
      type={type ?? 'text'}
      onChange={onChange}
    />
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
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, project_id, deleted: false },
      // include: { widget_types: true }, // errors
    }),
  )
  const widgetTypeIds = useMemo(
    () => fields.map((field) => field.widget_type_id),
    [fields.length],
  )
  const fieldTypeIds = useMemo(
    () => fields.map((field) => field.field_type_id),
    [fields.length],
  )

  const { result: widgetTypes = [] } = useLiveQuery(
    () =>
      db.widget_types.findMany({
        where: {
          widget_type_id: {
            in: widgetTypeIds,
          },
        },
      }),
    [widgetTypeIds.length],
  )
  const { result: fieldTypes = [] } = useLiveQuery(
    () =>
      db.field_types.findMany({
        where: {
          field_type_id: {
            in: fieldTypeIds,
          },
        },
      }),
    [fieldTypeIds.length],
  )

  const onChange = useCallback(
    (e, dataReturned) => {
      const { name, value } = getValueFromChange(e, dataReturned)
      const val = { ...data, [name]: value }
      db[table].update({
        where: { [idField]: id },
        data: { [jsonFieldName]: val },
      })
    },
    [db, id, idField, jsonFieldName, data, table],
  )

  console.log('Jsonb:', {
    fieldTypes,
    widgetTypes,
    data,
    fields,
    widgetTypeIds,
    fieldTypeIds,
  })

  return fields.map((field, index) => {
    const { name, field_label } = field
    const widgetType = widgetTypes.find(
      (widgetType) => widgetType.widget_type_id === field.widget_type_id,
    )
    const Widget = widget?.[widgetType?.name]
    const fieldType = fieldTypes.find(
      (fieldType) => fieldType.field_type_id === field.field_type_id,
    )
    const type = fieldType?.name === 'integer' ? 'number' : fieldType?.name
    console.log('Jsonb, rendering fields', {
      name,
      field_label,
      fieldType,
      widgetType,
      Widget,
      type,
    })

    if (!Widget) {
      return null
    }

    return (
      <Widget
        key={`${name}/${index}`}
        label={field_label}
        name={name}
        type={type}
        value={data?.[name] ?? ''}
        onChange={onChange}
      />
    )
  })
}
