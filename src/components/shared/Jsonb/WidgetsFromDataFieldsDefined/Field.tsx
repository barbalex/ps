import { memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { TextField } from '../../TextField.tsx'
import { EditField } from './EditField.tsx'
import { Widget } from './Widget.tsx'

// TODO: Uncaught (in promise) error: invalid input syntax for type uuid: ""
export const Field = memo(
  ({
    field,
    index,
    onChange,
    data,
    table,
    jsonFieldName,
    id,
    idField,
    autoFocus,
    ref,
  }) => {
    const [searchParams] = useSearchParams()
    const editingField = searchParams.get('editingField')

    const resultFieldType = useLiveQuery(
      `SELECT * FROM field_types where field_type_id = $1`,
      [field.field_type_id],
    )
    const fieldType = resultFieldType?.rows?.[0]

    const resultWidgetType = useLiveQuery(
      `SELECT * FROM widget_types where widget_type_id = $1`,
      [field.widget_type_id],
    )
    const widgetType = resultWidgetType?.rows?.[0]

    // TODO: drag and drop to order
    // only if editing
    // not if editingField
    if (editingField === field.field_id) {
      return (
        <FieldFormInForm
          key={field.field_id}
          field={field}
        />
      )
    }
    const { name, field_label } = field
    const type = fieldType?.name === 'integer' ? 'number' : fieldType?.name

    if (!widgetType?.name && !widgetType?.text) {
      return null
    }
    const value = data?.[name] ?? ''
    if (!widgetType?.name) {
      return (
        <TextField
          key={`${name}/${index}`}
          label={field_label}
          name={name}
          value={value}
          type={type ?? 'text'}
          onChange={onChange}
          autoFocus={autoFocus && index === 0}
          ref={ref}
          button={<EditField field_id={field.field_id} />}
        />
      )
    }

    return (
      <Widget
        key={`${name}/${index}`}
        name={name}
        type={type}
        field={field}
        index={index}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        widgetType={widgetType}
        autoFocus={autoFocus && index === 0}
        ref={ref}
      />
    )
  },
)
