import { memo, useState, useRef, useContext, useEffect } from 'react'
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

function getItemData({ field, index, instanceId }) {
  return {
    [itemKey]: true,
    field,
    index,
    instanceId,
  }
}

const previewStyle = {
  padding: '0.5rem',
  backgroundColor: 'white',
  borderRadius: '0.25rem',
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  border: '1px solid #ccc',
}

// this component focuses on drag and drop
// D&D is only enabled when no field is being edited
export const WidgetDragAndDrop = memo(
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
    enableDragAndDrop,
  }) => {
    const { registerItem, instanceId } = useDragAndDropContext()
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
    const elementRef = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [draggableState, setDraggableState] =
      useState<DraggableState>(idleState)

    useEffect(() => {
      if (!enableDragAndDrop) {
        return
      }
      const element = elementRef.current
      const dragHandle = dragHandleRef.current
      invariant(element)
      invariant(dragHandle)

      const data = getItemData({ field, index, instanceId })

      // draggable returns its cleanup function
      return combine(
        registerItem({
          itemId: field.field_id,
          element,
        }),
        draggable({
          element: dragHandle,
          canDrag: () => fieldsCount > 1,
          getInitialData: () => data,
          onGenerateDragPreview({ nativeSetDragImage }) {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
              render({ container }) {
                setDraggableState({ type: 'preview', container })

                return () => setDraggableState(draggingState)
              },
            })
          },
          onDragStart() {
            setDraggableState(draggingState)
          },
          onDrop() {
            setDraggableState(idleState)
          },
        }),
        dropTargetForElements({
          element,
          canDrop({ source }) {
            return (
              isItemData(source.data) && source.data.instanceId === instanceId
            )
          },
          getData({ input }) {
            return attachClosestEdge(data, {
              element,
              input,
              allowedEdges: ['top', 'bottom'],
            })
          },
          onDrag({ self, source }) {
            const isSource =
              source.data.field.field_id === element.dataset.field_id
            if (isSource) {
              setClosestEdge(null)
              return
            }

            const closestEdge = extractClosestEdge(self.data)

            const sourceIndex = source.data.index
            invariant(typeof sourceIndex === 'number')

            const isItemBeforeSource = index === sourceIndex - 1
            const isItemAfterSource = index === sourceIndex + 1

            const isDropIndicatorHidden =
              (isItemBeforeSource && closestEdge === 'bottom') ||
              (isItemAfterSource && closestEdge === 'top')

            if (isDropIndicatorHidden) {
              setClosestEdge(null)
              return
            }

            setClosestEdge(closestEdge)
          },
          onDragLeave() {
            setClosestEdge(null)
          },
          onDrop() {
            setClosestEdge(null)
          },
        }),
      )
    }, [index, instanceId, field, fieldsCount, registerItem, enableDragAndDrop])

    const canDrag = fieldsCount > 1 && enableDragAndDrop

    // TODO: drag and drop to order
    // only if editing
    // not if editingField

    return (
      <>
        <div
          ref={elementRef}
          style={containerStyle}
        >
          {canDrag && <DragHandle ref={dragHandleRef} />}
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
          {closestEdge && (
            <DropIndicator
              edge={closestEdge}
              gap="1px"
            />
          )}
        </div>
        {draggableState.type === 'preview' &&
          createPortal(
            <div style={previewStyle}>{field.label}</div>,
            draggableState.container,
          )}
      </>
    )
  },
)
