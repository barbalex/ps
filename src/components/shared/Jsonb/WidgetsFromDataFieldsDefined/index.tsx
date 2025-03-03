import { memo, useState, useCallback } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'

import { Field } from './Field.tsx'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
} from '../../../shared/DragAndDrop/index.tsx'

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

    const [registry] = useState(getItemRegistry)

    // Isolated instances of this component from one another
    const [instanceId] = useState(() => Symbol('instance-id'))
    
      const reorderItem = useCallback(
        async ({
          startIndex,
          indexOfTarget,
          closestEdgeOfTarget,
        }: ReorderItemProps) => {
          const finishIndex = getReorderDestinationIndex({
            startIndex,
            closestEdgeOfTarget,
            indexOfTarget,
            axis: 'vertical',
          })
    
          if (finishIndex === startIndex) {
            // If there would be no change, we skip the update
            return
          }
    
          // const newLayerSorting = reorder({
          //   list: layerPresentationIds,
          //   startIndex,
          //   finishIndex,
          // })
          // setMapLayerSorting(newLayerSorting)
          // TODO: set all sort_index'es in the involved fields
        },
        [],
      )

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
