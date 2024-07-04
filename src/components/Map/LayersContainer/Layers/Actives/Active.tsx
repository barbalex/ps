import { memo, useCallback, useRef, useEffect, useState } from 'react'
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
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../modules/createRows.ts'
import { SliderField } from '../../../../shared/SliderField.tsx'
import {
  Vector_layers as VectorLayer,
  Tile_layers as TileLayer,
} from '../../../../../generated/client/index.ts'

import './active.css'

type Props = {
  layer: VectorLayer | TileLayer
  index: boolean
  layerCount: number
}

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

export const ActiveLayer = memo(({ layer, isLast, layerCount }: Props) => {
  const { db } = useElectric()!

  const onChangeActive = useCallback(
    (layer) => {
      // update layer_presentations, set active = false
      const presentation = layer.layer_presentations?.[0]
      if (presentation) {
        return db.layer_presentations.update({
          where: { layer_presentation_id: presentation.layer_presentation_id },
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

  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const draggableRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // draggable returns its cleanup function
    return draggable({
      element: draggableRef.current,
      dragHandle: dragHandleRef.current,
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
    })
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
    </ErrorBoundary>
  )
})
