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
import { SwitchField } from '../../../../shared/SwitchField.tsx'
import {
  Vector_layers as VectorLayer,
  Wms_layers as WmsLayer,
} from '../../../../../generated/client/index.ts'
import { ListContext } from './index.tsx'
import { itemKey, isItemData } from './shared.ts'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'

import './active.css'

function useListContext() {
  const listContext = useContext(ListContext)
  invariant(listContext !== null)

  return listContext
}

type Props = {
  layer: VectorLayer | WmsLayer
  index: boolean
  layerCount: number
}

type ItemData = {
  [itemKey]: true
  layer: VectorLayer | WmsLayer
  index: number
  instanceId: symbol
}

function getItemData({
  layer,
  index,
  instanceId,
}: {
  layer: VectorLayer | WmsLayer
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
  padding: '0.5rem',
  backgroundColor: 'white',
  borderRadius: '0.25rem',
}
const dragHandleStyle = {
  display: 'flex',
  alignItems: 'center',
}
const dragIndicatorStyle = {
  fontSize: 'x-large',
  color: 'rgba(55, 118, 28, 0.6)',
  paddingRight: 5,
  cursor: 'grab',
}

export const ActiveLayer = memo(
  ({ layer, index, isLast, layerCount }: Props) => {
    const { db } = useElectric()!

    const layerPresentation = layer.layer_presentations?.[0]

    const onChange = useCallback(
      (e, data) => {
        if (!layerPresentation) {
          // if no presentation exists, create notification
          const data = createNotification({
            title: 'Layer presentation not found',
            type: 'warning',
          })
          return db.notifications.create({ data })
        }
        const { name, value } = getValueFromChange(e, data)
        db.layer_presentations.update({
          where: {
            layer_presentation_id: layerPresentation.layer_presentation_id,
          },
          data: { [name]: value },
        })
      },
      [db.layer_presentations, db.notifications, layerPresentation],
    )

    const { registerItem, instanceId } = useListContext()
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
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
              source.data.layer.layer_presentations?.[0]
                .layer_presentation_id === element.dataset.presentationId
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
    }, [
      index,
      instanceId,
      layer,
      layerCount,
      layerPresentation.layer_presentation_id,
      registerItem,
    ])

    const canDrag = layerCount > 1

    // TODO: drag and drop items by dragging the drag icon
    // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
    return (
      <ErrorBoundary>
        <AccordionItem
          value={layer.layer_presentations?.[0]?.layer_presentation_id}
          ref={ref}
          style={{
            // needed for the drop indicator to appear
            position: 'relative',
            borderTop: '1px solid rgba(55, 118, 28, 0.5)',
            ...(isLast
              ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
              : {}),
          }}
          data-presentation-id={
            layer.layer_presentations?.[0]?.layer_presentation_id
          }
        >
          <AccordionHeader
            expandIconPosition="end"
            size="extra-large"
          >
            <div
              ref={dragHandleRef}
              style={dragHandleStyle}
              onClick={(e) => e.preventDefault()}
              title="drag to reorder"
            >
              {canDrag && <MdDragIndicator style={dragIndicatorStyle} />}
            </div>
            <Checkbox
              size="large"
              name="active"
              label={layer.label}
              checked={layerPresentation.active}
              onChange={onChange}
            />
          </AccordionHeader>
          <AccordionPanel style={panelStyle}>
            <SliderField
              label="Opacity (%)"
              name="opacity_percent"
              min={0}
              max={100}
              value={layerPresentation.opacity_percent}
              onChange={onChange}
            />
            {layer.wms_layer_id && (
              <>
                <SwitchField
                  label="Transparent"
                  name="transparent"
                  value={layerPresentation.transparent}
                  onChange={onChange}
                />
                <SwitchField
                  label="Grayscale"
                  name="grayscale"
                  value={layerPresentation.grayscale}
                  onChange={onChange}
                />
              </>
            )}
          </AccordionPanel>
          {closestEdge && (
            <DropIndicator
              edge={closestEdge}
              gap="1px"
            />
          )}
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
