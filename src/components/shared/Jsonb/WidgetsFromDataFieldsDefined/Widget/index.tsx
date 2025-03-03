import { memo, useState, useRef, useContext } from 'react'
import { createPortal } from 'react-dom'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import invariant from 'tiny-invariant'

import { Widget } from './Widget.tsx'
import { DragAndDropContext } from '../DragAndDropContext.ts'

import {
  idleState,
  draggingState,
  DraggableState,
  itemKey,
  isItemData,
} from '../../../../shared/DragAndDrop/index.tsx'
import { DragHandle } from '../../../../shared/DragAndDrop/DragHandle.tsx'

function useDragAndDropContext() {
  const dragAndDropContext = useContext(DragAndDropContext)
  invariant(dragAndDropContext !== null)

  return dragAndDropContext
}

function getItemData({ layer, index, instanceId }) {
  return {
    [itemKey]: true,
    layer,
    index,
    instanceId,
  }
}

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
    const { registerItem, instanceId } = useDragAndDropContext()
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
    const elementRef = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [draggableState, setDraggableState] =
      useState<DraggableState>(idleState)
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
