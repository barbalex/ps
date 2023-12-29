// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { TextField } from './TextField'
import { DropdownField } from './DropdownField'
import { DropdownFieldFromList } from './DropdownFieldFromList'
import { RadioGroupFromList } from './RadioGroupFromList'
import { DateField } from './DateField'

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
  'options-many': ({ name, label, list_id, value, onChange }) => (
    <DropdownFieldFromList
      name={name}
      label={label}
      list_id={list_id}
      value={value}
      onChange={onChange}
    />
  ),
  'options-few': ({ name, label, list_id, value, onChange }) => (
    <RadioGroupFromList
      name={name}
      label={label}
      list_id={list_id}
      value={value}
      onChange={onChange}
    />
  ),
  datepicker: ({ label, name, value, onChange }) => (
    <DateField
      label={label}
      name={name}
      // in json date is saved as iso string
      value={value ? new Date(value) : null}
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

export const Jsonb = memo(
  ({ table, name: jsonFieldName = 'data', idField, id, data = {} }) => {
    const { project_id } = useParams()
    const { db } = useElectric()!

    const [fetchedData, setFetchedData] = useState({
      fields: [],
      fieldTypes: [],
      widgetTypes: [],
    })
    useEffect(() => {
      const fetchData = async () => {
        const fields = await db.fields.findMany({
          where: { table_name: table, project_id, deleted: false },
        })
        const fieldTypes = await db.field_types.findMany({
          where: {
            field_type_id: {
              in: fields.map((field) => field.field_type_id),
            },
          },
        })
        const widgetTypes = await db.widget_types.findMany({
          where: {
            widget_type_id: {
              in: fields.map((field) => field.widget_type_id),
            },
          },
        })
        setFetchedData({ fields, fieldTypes, widgetTypes })
      }
      fetchData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db])

    const onChange = useCallback(
      (e, dataReturned) => {
        const { name, value } = getValueFromChange(e, dataReturned)
        const isDate = value instanceof Date
        // in json need to save date as iso string
        const val = { ...data, [name]: isDate ? value.toISOString() : value }
        // console.log('Jsonb, onChange', {
        //   name,
        //   value,
        //   val,
        //   jsonFieldName,
        //   isDate,
        //   dateIsoString: isDate ? value.toISOString() : undefined,
        // })
        db[table].update({
          where: { [idField]: id },
          data: { [jsonFieldName]: val },
        })
      },
      [db, id, idField, jsonFieldName, data, table],
    )

    // What if data contains keys not existing in fields? > show but warn
    const fieldNamesDefined = fetchedData.fields.map((field) => field.name)
    const dataKeys = Object.keys(data)
    const dataKeysNotDefined = dataKeys.filter(
      (dataKey) => !fieldNamesDefined.includes(dataKey),
    )

    const widgetsFromDataFieldsDefined = fetchedData.fields.map(
      (field, index) => {
        const { name, field_label } = field
        const widgetType = fetchedData.widgetTypes.find(
          (widgetType) => widgetType.widget_type_id === field.widget_type_id,
        )
        const Widget = widget?.[widgetType?.name] ?? widget?.text
        const fieldType = fetchedData.fieldTypes.find(
          (fieldType) => fieldType.field_type_id === field.field_type_id,
        )
        const type = fieldType?.name === 'integer' ? 'number' : fieldType?.name

        if (!Widget) {
          return null
        }

        return (
          <Widget
            key={`${name}/${index}`}
            label={field_label}
            name={name}
            type={type ?? 'text'}
            list_id={field.list_id}
            value={data?.[name] ?? ''}
            onChange={onChange}
          />
        )
      },
    )

    const fieldsFromDataKeysNotDefined = dataKeysNotDefined.map((dataKey) => {
      return (
        <TextField
          key={dataKey}
          label={dataKey}
          name={dataKey}
          value={
            data?.[dataKey]?.toLocaleDateString?.() ?? data?.[dataKey] ?? ''
          }
          onChange={onChange}
          validationState="warning"
          validationMessage="This field is not defined for this project."
        />
      )
    })

    // console.log('Jsonb', {
    //   widgetsFromDataFieldsDefined,
    //   fieldsFromDataKeysNotDefined,
    //   fieldsFromDataKeysNotDefined,
    //   fieldNamesDefined,
    // })

    return [widgetsFromDataFieldsDefined, fieldsFromDataKeysNotDefined]
  },
)
