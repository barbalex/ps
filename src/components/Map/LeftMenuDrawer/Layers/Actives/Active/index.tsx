import { useRef, useEffect, useState, useContext } from 'react'
import { createPortal } from 'react-dom'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { AccordionItem } = fluentUiReactComponents
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

import { ErrorBoundary } from '../../../../../shared/ErrorBoundary.tsx'
import { DragAndDropContext } from '../DragAndDropContext.ts'
import {
  idleState,
  draggingState,
  DraggableState,
  itemKey,
  isItemData,
} from '../../../../../shared/DragAndDrop/index.tsx'
import { Content } from './Content.tsx'

import './active.css'
import styles from './index.module.css'

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

export const ActiveLayer = ({ layer, index, isLast, isOpen, layerCount }) => {
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

    invariant(element)
    invariant(dragHandle)

    const data = getItemData({ layer, index, instanceId })

    // draggable returns its cleanup function
    return combine(
      registerItem({
        itemId: layer.layer_presentation_id,
        element,
      }),
      draggable({
        element: dragHandle,
        canDrag: () => layerCount > 1,
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
            source.data.layer.layer_presentation_id ===
            element.dataset.presentationId
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
  }, [index, instanceId, layer, layerCount, registerItem])

  const accordionStyle = {
    '--top-border-width': isOpen ? 3 : 1,
    '--bottom-border-width': isOpen ? 3 : isLast ? 1 : 0,
  }

  // drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.layer_presentation_id}
        ref={elementRef}
        className={styles.accordionItem}
        style={accordionStyle}
      >
        <Content
          layer={layer}
          isOpen={isOpen}
          layerCount={layerCount}
          dragHandleRef={dragHandleRef}
        />
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
      </AccordionItem>
      {draggableState.type === 'preview' &&
        createPortal(
          <div className={styles.preview}>{layer.label}</div>,
          draggableState.container,
        )}
    </ErrorBoundary>
  )
}
