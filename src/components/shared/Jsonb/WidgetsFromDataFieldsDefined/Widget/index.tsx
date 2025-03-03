import { memo } from 'react'

import { Widget } from './Widget.tsx'

// this component focuses on drag and drop
// D&D is only enabled when no field is being edited
export const WidgetDragAndDrop = memo(
  ({
    field,
    data,
    table,
    jsonFieldName,
    id,
    idField,
    autoFocus,
    ref,
    enableDragAndDrop,
  }) => {
    // TODO: drag and drop to order
    // only if editing
    // not if editingField

    return (
      <Widget
        name={field.name}
        field={field}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        autoFocus={autoFocus}
        ref={ref}
      />
    )
  },
)
