import { memo } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'

import { Field } from './Field.tsx'

// TODO: Uncaught (in promise) error: invalid input syntax for type uuid: ""
export const WidgetsFromDataFieldsDefined = memo(
  ({
    fields,
    data = {},
    table,
    jsonFieldName,
    idField,
    id,
    autoFocus,
    ref,
  }) => {
    // TODO: drag and drop to order
    // only if editing
    // not if editingField
    return fields.map((field, index) => (
      <Field
        key={field.field_id}
        field={field}
        index={index}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        autoFocus={autoFocus}
        ref={ref}
      />
    ))
  },
)
