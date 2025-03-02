import { memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { Widget } from './Widget.tsx'

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

    const resultFieldType = useLiveIncrementalQuery(
      `SELECT * FROM field_types where field_type_id = $1`,
      [field.field_type_id],
      'field_type_id',
    )
    const fieldType = resultFieldType?.rows?.[0]

    const resultWidgetType = useLiveIncrementalQuery(
      `SELECT * FROM widget_types where widget_type_id = $1`,
      [field.widget_type_id],
      'widget_type_id',
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
    const type = fieldType?.name === 'integer' ? 'number' : fieldType?.name

    // TODO: is this needed?
    // if (!widgetType?.name && !widgetType?.text) {
    //   return null
    // }

    return (
      <Widget
        key={`${field.name}/${index}`}
        name={field.name}
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
