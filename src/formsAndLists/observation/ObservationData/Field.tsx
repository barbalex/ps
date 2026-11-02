import { useRef, useState, useEffect } from 'react'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import Linkify from 'linkify-react'

import { isObservationFieldData, observationFieldKey } from './dnd.ts'
import styles from './Field.module.css'

export const Field = ({
  label,
  value,
  moveField,
}: {
  label: string
  value: unknown
  moveField: (
    draggedLabel: string,
    hoveredLabel: string,
    pointerBelowMiddle: boolean,
  ) => void
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // moveField changes on every parent render;
  // a ref keeps the drop target registered only once per label
  const moveFieldRef = useRef(moveField)
  useEffect(() => {
    moveFieldRef.current = moveField
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    return combine(
      draggable({
        element,
        getInitialData: () => ({ [observationFieldKey]: true, id: label }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => isObservationFieldData(source.data),
        onDrag: ({ source, location }) => {
          const draggedLabel = source.data.id
          if (typeof draggedLabel !== 'string' || draggedLabel === label) return

          const rect = element.getBoundingClientRect()
          const pointerBelowMiddle =
            location.current.input.clientY > rect.top + rect.height / 2
          moveFieldRef.current(draggedLabel, label, pointerBelowMiddle)
        },
      }),
    )
  }, [label])

  return (
    <div
      ref={ref}
      data-field-label={label}
      className={`${styles.row}${isDragging ? ` ${styles.rowDragging}` : ''}`}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        <Linkify options={{ target: '_blank' }}>
          {value as React.ReactNode}
        </Linkify>
      </div>
    </div>
  )
}
