import { useState, useRef, useContext, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/utils/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/utils/set-custom-native-drag-preview'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import invariant from 'tiny-invariant'

import { DragAndDropContext } from './DragAndDropContext.ts'

import {
  idleState,
  draggingState,
  type DraggableState,
  itemKey,
  isItemData,
} from '../../DragAndDrop/index.tsx'
import { DragHandle } from '../../DragAndDrop/DragHandle.tsx'

import styles from './sortableItem.module.css'

function useDragAndDropContext() {
  const dragAndDropContext = useContext(DragAndDropContext)
  invariant(dragAndDropContext !== null)

  return dragAndDropContext
}

/**
 * One item of the form's sortable list — a jsonb field or a real column —
 * holding its widget with a drag handle. The list around it (see
 * WidgetsFromDataFieldsDefined) reports moves of its items to the store.
 * Rendered only while sorting is enabled (design mode, no field edited).
 */
export const SortableItem = ({
  itemId,
  label,
  index,
  count,
  children,
}: {
  /** names the item in its list; the list reports moves by it */
  itemId: string
  /** shown while the item is dragged */
  label: string
  index: number
  /** the number of items in the list */
  count: number
  children: ReactNode
}) => {
  const { registerItem, instanceId } = useDragAndDropContext()
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState)

  useEffect(() => {
    const element = elementRef.current
    const dragHandle = dragHandleRef.current
    if (!element || !dragHandle) return

    const data = { [itemKey]: true, itemId, index, instanceId }

    // draggable returns its cleanup function
    return combine(
      registerItem({ itemId, element }),
      draggable({
        element: dragHandle,
        canDrag: () => count > 1,
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
          // no drop indicator on the dragged item itself
          if (source.data.itemId === itemId) {
            setClosestEdge(null)
            return
          }

          const closestEdge = extractClosestEdge(self.data)

          const sourceIndex = source.data.index
          invariant(typeof sourceIndex === 'number')

          // the neighbour towards the dragged item shows no indicator on the
          // edge facing it: dropping there would change nothing
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
  }, [itemId, index, instanceId, count, registerItem])
  // the elements come from refs: they are set before the effect runs, and
  // the handle only appears or leaves when `count` crosses one

  return (
    <>
      <div
        ref={elementRef}
        className={styles.container}
        data-sortable-item={itemId}
      >
        {count > 1 && <DragHandle ref={dragHandleRef} />}
        {children}
        {closestEdge && (
          <DropIndicator
            edge={closestEdge}
            gap="1px"
          />
        )}
      </div>
      {draggableState.type === 'preview' &&
        createPortal(
          <div className={styles.preview}>{label}</div>,
          draggableState.container,
        )}
    </>
  )
}
