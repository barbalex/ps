import {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  createContext,
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
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
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

import './active.css'

type ItemPosition = 'first' | 'last' | 'middle' | 'only'

type CleanupFn = () => void

type ItemEntry = { itemId: string; element: HTMLElement }

type ListContextValue = {
  getListLength: () => number
  registerItem: (entry: ItemEntry) => CleanupFn
  reorderItem: (args: {
    startIndex: number
    indexOfTarget: number
    closestEdgeOfTarget: Edge | null
  }) => void
  instanceId: symbol
}

const ListContext = createContext<ListContextValue | null>(null)

type Props = {
  layer: VectorLayer | TileLayer
  index: boolean
  layerCount: number
}

function useListContext() {
  const listContext = useContext(ListContext)
  invariant(listContext !== null)

  return listContext
}

type Item = {
  id: string
  label: string
}

const itemKey = Symbol('item')
type ItemData = {
  [itemKey]: true
  item: Item
  index: number
  instanceId: symbol
}

function getItemData({
  item,
  index,
  instanceId,
}: {
  item: Item
  index: number
  instanceId: symbol
}): ItemData {
  return {
    [itemKey]: true,
    item,
    index,
    instanceId,
  }
}

function isItemData(data: Record<string | symbol, unknown>): data is ItemData {
  return data[itemKey] === true
}

function getItemPosition({
  index,
  items,
}: {
  index: number
  items: Item[]
}): ItemPosition {
  if (items.length === 1) {
    return 'only'
  }

  if (index === 0) {
    return 'first'
  }

  if (index === items.length - 1) {
    return 'last'
  }

  return 'middle'
}

type DraggableState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' }

const idleState: DraggableState = { type: 'idle' }
const draggingState: DraggableState = { type: 'dragging' }

const containerStyle = {
  borderTop: '1px solid rgba(55, 118, 28, 0.5)',
}
const panelStyle = {
  paddingBottom: 8,
}
const dragIconStyle = {
  fontSize: 'x-large',
  color: 'rgba(55, 118, 28, 0.6)',
  paddingRight: 5,
  cursor: 'grab',
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
        console.log('onChangeOpacity', { layerPresentation, value })
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
    const draggableRef = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [draggableState, setDraggableState] =
      useState<DraggableState>(idleState)
    useEffect(() => {
      const element = draggableRef.current
      invariant(element)
      const dragHandle = dragHandleRef.current
      invariant(dragHandle)

      const data = getItemData({ item: layer, index, instanceId })

      // draggable returns its cleanup function
      return combine(
        draggable({
          element: dragHandle,
          canDrag: () => layerCount > 1,
          onDrag: ({ self, source }) => {
            // TODO:
          },
          onDrop: (source, destination) => {
            console.log('onDrop', { source, destination })
          },
          getInitialData: () => ({
            layerPresentationId: layerPresentation.layer_presentation_id,
          }),
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
            const isSource = source.element === element
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
    }, [layerCount, layerPresentation.layer_presentation_id])

    // TODO: drag and drop items by dragging the drag icon
    // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
    return (
      <ErrorBoundary>
        <AccordionItem
          value={layer.vector_layer_id ?? layer.tile_layer_id}
          ref={draggableRef}
        >
          <div
            style={{
              ...containerStyle,
              ...(isLast
                ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
                : {}),
            }}
          >
            <AccordionHeader expandIconPosition="end" size="extra-large">
              <MdDragIndicator
                style={dragIconStyle}
                ref={dragHandleRef}
                onClick={(e) => e.preventDefault()}
              />
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
          </div>
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
