import { memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { WidgetDragAndDrop } from './Widget/index.tsx'
import { designingAtom } from '../../../../store.ts'

// this component decides whether to show the form or the widget
export const Field = memo(
  ({
    field,
    fieldsCount,
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
    const [designing] = useAtom(designingAtom)

    if (editingField === field.field_id) {
      return (
        <FieldFormInForm
          key={field.field_id}
          field={field}
        />
      )
    }

    return (
      <WidgetDragAndDrop
        key={`${field.name}/${index}`}
        name={field.name}
        field={field}
        fieldsCount={fieldsCount}
        index={index}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        autoFocus={autoFocus && index === 0}
        ref={ref}
        enableDragAndDrop={!editingField && designing}
      />
    )
  },
)
