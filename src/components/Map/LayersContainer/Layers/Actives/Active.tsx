import {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useContext,
} from 'react'
import { createPortal } from 'react-dom'
import { Checkbox } from '@fluentui/react-components'
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components'
import { MdDragIndicator } from 'react-icons/md'
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

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../modules/createRows.ts'
import { SliderField } from '../../../../shared/SliderField.tsx'
import {
  Vector_layers as VectorLayer,
  Tile_layers as TileLayer,
} from '../../../../../generated/client/index.ts'
import { ListContext } from './index.tsx'

import './active.css'

function useListContext() {
  const listContext = useContext(ListContext)
  invariant(listContext !== null)

  return listContext
}

type Props = {
  layer: VectorLayer | TileLayer
  index: boolean
  layerCount: number
}

const itemKey = Symbol('item')
type ItemData = {
  [itemKey]: true
  layer: VectorLayer | TileLayer
  index: number
  instanceId: symbol
}

function getItemData({
  layer,
  index,
  instanceId,
}: {
  layer: VectorLayer | TileLayer
  index: number
  instanceId: symbol
}): ItemData {
  return {
    [itemKey]: true,
    layer,
    index,
    instanceId,
  }
}

function isItemData(data: Record<string | symbol, unknown>): data is ItemData {
  return data[itemKey] === true
}

type DraggableState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' }

const idleState: DraggableState = { type: 'idle' }
const draggingState: DraggableState = { type: 'dragging' }

const panelStyle = {
  paddingBottom: 8,
}
const previewStyle = {
  border: '1px solid red',
  padding: '0.5rem',
  backgroundColor: 'white',
  borderRadius: '0.25rem',
}

export const ActiveLayer = memo(
  ({ layer, index, isLast, layerCount }: Props) => {
    const { db } = useElectric()!

    const onChangeActive = useCallback(
      (layer) => {
        // update layer_presentations, set active = false
        const presentation = layer.layer_presentations?.[0]
        if (presentation) {
          return db.layer_presentations.update({
            where: {
              layer_presentation_id: presentation.layer_presentation_id,
            },
            data: { active: false },
          })
        }
        // if no presentation exists, create notification
        const data = createNotification({
          title: 'Layer presentation not found',
          type: 'warning',
        })
        db.notifications.create({ data })
      },
      [db],
    )
    const onChangeOpacity = useCallback(
      (layerPresentation, value) => {
        db.layer_presentations.update({
          where: {
            layer_presentation_id: layerPresentation.layer_presentation_id,
          },
          data: { opacity_percent: value },
        })
      },
      [db.layer_presentations],
    )

    const layerPresentation = layer.layer_presentations?.[0]

    const { registerItem, instanceId } = useListContext()
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
    console.log('Active.closestEdge:', closestEdge)
    const ref = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [draggableState, setDraggableState] =
      useState<DraggableState>(idleState)

    useEffect(() => {
      const element = ref.current
      const dragHandle = dragHandleRef.current
      invariant(element)
      invariant(dragHandle)

      const data = getItemData({ layer, index, instanceId })
      console.log('Active.useEffect, data:', data)

      // draggable returns its cleanup function
      return combine(
        registerItem({
          itemId: layer.layer_presentations?.[0]?.layer_presentation_id,
          element,
        }),
        draggable({
          element: dragHandle,
          canDrag: () => layerCount > 1,
          getInitialData: () => data,
          onGenerateDragPreview({ nativeSetDragImage }) {
            console.log('Active.draggable.onGenerateDragPreview')
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
            console.log('Active.draggable.onDragStart')
            setDraggableState(draggingState)
          },
          onDrop() {
            console.log('Active.draggable.onDrop')
            setDraggableState(idleState)
          },
        }),
        dropTargetForElements({
          element,
          canDrop({ source }) {
            // console.log(
            //   'Active.dropTargetForElements.canDrop',
            //   isItemData(source.data) && source.data.instanceId === instanceId,
            // )
            // works
            return (
              isItemData(source.data) && source.data.instanceId === instanceId
            )
          },
          getData({ input }) {
            // console.log(
            //   'Active.dropTargetForElements.getData',
            //   attachClosestEdge(data, {
            //     element,
            //     input,
            //     allowedEdges: ['top', 'bottom'],
            //   }),
            // )
            // works
            return attachClosestEdge(data, {
              element,
              input,
              allowedEdges: ['top', 'bottom'],
            })
          },
          onDrag({ self, source }) {
            console.log('Active.dropTargetForElements.onDrag', {
              element,
              sourceElement: source.element,
            })
            const isSource = source.element === element
            console.log(
              'Active.dropTargetForElements.onDrag, isSource:',
              isSource,
            )
            if (isSource) {
              setClosestEdge(null)
              return
            }

            const closestEdge = extractClosestEdge(self.data)
            // console.log(
            //   'Active.dropTargetForElements.onDrag, closestEdge:',
            //   closestEdge,
            // )
            // works

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
            console.log('Active.dropTargetForElements.onDragLeave')
            setClosestEdge(null)
          },
          onDrop() {
            console.log('Active.dropTargetForElements.onDrop')
            setClosestEdge(null)
          },
        }),
      )
    }, [
      index,
      instanceId,
      layer,
      layerCount,
      layerPresentation.layer_presentation_id,
      registerItem,
    ])

    // TODO: drag and drop items by dragging the drag icon
    // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
    return (
      <ErrorBoundary>
        <AccordionItem
          value={layer.layer_presentations?.[0]?.layer_presentation_id}
          ref={ref}
          style={{
            borderTop: '1px solid rgba(55, 118, 28, 0.5)',
            ...(isLast
              ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
              : {}),
          }}
        >
          <AccordionHeader expandIconPosition="end" size="extra-large">
            <div
              ref={dragHandleRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                ...(layerCount <= 1 ? { cursor: 'not-allowed' } : {}),
              }}
              onClick={(e) => e.preventDefault()}
            >
              <MdDragIndicator
                style={{
                  fontSize: 'x-large',
                  color: 'rgba(55, 118, 28, 0.6)',
                  paddingRight: 5,
                  cursor: 'grab',
                  ...(layerCount <= 1 ? { color: '#b7b7b7' } : {}),
                }}
              />
            </div>
            <Checkbox
              size="large"
              label={layer.label}
              checked={layerPresentation.active}
              onChange={() => onChangeActive(layer)}
            />
          </AccordionHeader>
          <AccordionPanel style={panelStyle}>
            <SliderField
              label="Opacity (%)"
              min={0}
              max={100}
              value={layerPresentation.opacity_percent}
              onChange={(_, data) =>
                onChangeOpacity(layerPresentation, data.value)
              }
            />
          </AccordionPanel>
          {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </AccordionItem>
        {draggableState.type === 'preview' &&
          createPortal(
            <div style={previewStyle}>{layer.label}</div>,
            draggableState.container,
          )}
      </ErrorBoundary>
    )
  },
)
