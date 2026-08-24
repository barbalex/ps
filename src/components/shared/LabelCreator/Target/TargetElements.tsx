import { useRef, useEffect, useState } from 'react'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'
import { BsArrowsMove } from 'react-icons/bs'

import { BetweenCharacters } from './BetweenCharacters.tsx'
import {
  isLabelCreatorData,
  labelCreatorItemKey,
} from '../dnd.ts'
import { LabelElement } from '../index.tsx'
import styles from './TargetElements.module.css'

interface TargetElementsProps {
  label: ({ type: 'field' | 'separator'; value: string; id?: string })[] | null
  onChange: (newLabel: LabelElement[] | null) => void
  instanceId: symbol
}

export const TargetElements = ({ label, onChange, instanceId }: TargetElementsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // the container is a drop target for empty space: append at the end
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    return dropTargetForElements({
      element,
      getData: () => ({
        [labelCreatorItemKey]: true,
        instanceId,
        targetContainer: true,
      }),
      canDrop({ source }) {
        return (
          isLabelCreatorData(source.data) &&
          source.data.instanceId === instanceId
        )
      },
      onDragEnter() {
        setIsDraggingOver(true)
      },
      onDragLeave() {
        setIsDraggingOver(false)
      },
      onDrop() {
        setIsDraggingOver(false)
      },
    })
  }, [instanceId])

  return (
    <div
      className={`${styles.targetContainer}${isDraggingOver ? ` ${styles.targetContainerDraggingOver}` : ''}`}
      ref={containerRef}
    >
      {label?.map((labelElement, index) => (
        <TargetElement
          key={labelElement.id ?? `${labelElement.type}-${labelElement.value}-${index}`}
          labelElement={labelElement}
          label={label}
          onChange={onChange}
          index={index}
          instanceId={instanceId}
        />
      ))}
    </div>
  )
}

interface TargetElementProps {
  labelElement: { type: 'field' | 'separator'; value: string; id?: string }
  label: ({ type: 'field' | 'separator'; value: string; id?: string })[] | null
  onChange: (newLabel: LabelElement[] | null) => void
  index: number
  instanceId: symbol
}

const TargetElement = ({
  labelElement,
  label,
  onChange,
  index,
  instanceId,
}: TargetElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const data = {
      [labelCreatorItemKey]: true,
      instanceId,
      kind: 'element',
      index,
    }

    return combine(
      draggable({
        element,
        getInitialData: () => data,
        onDragStart() {
          setIsDragging(true)
        },
        onDrop() {
          setIsDragging(false)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return (
            isLabelCreatorData(source.data) &&
            source.data.instanceId === instanceId
          )
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['left', 'right'],
          })
        },
        onDrag({ self, source }) {
          if (source.data.index === index) {
            setClosestEdge(null)
            return
          }
          setClosestEdge(extractClosestEdge(self.data))
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      }),
    )
  }, [index, instanceId, labelElement])

  return (
    <div ref={elementRef} className={styles.elementContainer}>
      {labelElement.type === 'field' ?
        <div
          className={`${styles.fieldElement}${isDragging ? ` ${styles.fieldElementDragging}` : ''}`}
        >
          {labelElement.value}
          <BsArrowsMove className={styles.fieldHandle} />
        </div>
      : <BetweenCharacters
          el={labelElement}
          label={label}
          onChange={onChange}
          index={index}
          isDragging={isDragging}
        >
          <BsArrowsMove className={styles.fieldHandle} />
        </BetweenCharacters>
      }
      {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
    </div>
  )
}
