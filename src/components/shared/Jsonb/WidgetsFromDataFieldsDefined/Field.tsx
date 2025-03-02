import { memo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { Widget } from './Widget.tsx'

export const Field = memo(
  ({
    field,
    index,
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
    const type = field.field_type === 'integer' ? 'number' : field.field_type

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
        autoFocus={autoFocus && index === 0}
        ref={ref}
      />
    )
  },
)
