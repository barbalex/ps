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

    return (
      <Widget
        key={`${field.name}/${index}`}
        name={field.name}
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
