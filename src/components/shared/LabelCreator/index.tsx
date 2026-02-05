import { useState, useRef } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { arrayMoveImmutable } from 'array-move'
import { uuidv7 } from '@kripod/uuidv7'
import { isEqual } from 'es-toolkit'

import { FieldList } from './FieldList.tsx'
import { Target } from './Target/index.tsx'
import styles from './index.module.css'

export interface LabelElement {
  type: 'field' | 'separator'
  value: string
}
interface Props {
  label: LabelElement[]
  fields: string[]
  name: string
  onChange: () => void
  buttonLabel?: string
  onApply?: () => Promise<void> | void
}

export const LabelCreator = ({
  label: labelPassed,
  fields,
  name,
  onChange: onChangePassed,
  buttonLabel,
  onApply,
}: Props) => {
  const [labelProp, setLabelProp] = useState(labelPassed)
  const [label, setLabel] = useState(() => structuredClone(labelPassed ?? []))

  // Reset local state when prop changes (getDerivedStateFromProps pattern)
  if (!isEqual(labelProp, labelPassed)) {
    setLabelProp(labelPassed)
    setLabel(structuredClone(labelPassed ?? []))
  }

  const onChange = (newLabel) => setLabel(newLabel)

  const labelChanged =
    (
      (!labelPassed || labelPassed?.length === 0) &&
      (!label || label?.length === 0)
    ) ?
      false
    : !isEqual(label, labelPassed)

  const saveToDb = () => onChangePassed({ target: { value: label, name } })

  const containerRef = useRef<HTMLDivElement>(null)

  const fieldLabelElements = (label ?? []).filter((el) => el.type === 'field')
  const fieldLabelValues = fieldLabelElements.map((el) => el.value)
  const unusedFields = fields.filter(
    (field) => !fieldLabelValues.includes(field),
  )
  const fieldLabels = unusedFields.map((field) => ({
    type: 'field',
    value: field,
    id: uuidv7(),
  }))

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (
      destination?.droppableId === source.droppableId &&
      destination?.index === source.index
    ) {
      // do nothing
      return
    }

    if (
      destination?.droppableId === source.droppableId &&
      destination?.index === source.index
    ) {
      // user moved something inside same droppable without changing index
      // do nothing
      return
    }
    if (
      destination?.droppableId === 'target' &&
      source.droppableId === 'fieldList'
    ) {
      // user pulled from field list into target
      // so need to add this to the label at the destination index
      let newLabel
      if (draggableId === 'separator') {
        newLabel = [
          ...label.slice(0, destination.index),
          {
            type: 'separator',
            value: '',
            id: uuidv7(),
          },
          ...label.slice(destination.index),
        ]
        // TODO: focus the field
      } else {
        const fieldLabel = fieldLabels.find((el) => el.id === draggableId)
        newLabel = [
          ...label.slice(0, destination.index),
          // clone the label
          { ...fieldLabel },
          ...label.slice(destination.index),
        ]
      }

      return onChange(newLabel)
    }

    if (
      destination?.droppableId === 'target' &&
      source.droppableId === 'target' &&
      destination?.index !== source.index
    ) {
      // user moved inside target, to different index
      const newLabel = arrayMoveImmutable(
        label,
        source.index,
        destination.index,
      )
      return onChange(newLabel)
    }

    if (
      source.droppableId === 'target' &&
      (!destination || destination.droppableId !== 'target')
    ) {
      // user pulled from target anywhere outside
      // remove the label element at this index
      const clonedLabel = [...label]
      clonedLabel.splice(source.index, 1)
      const newLabel = clonedLabel.length ? clonedLabel : null
      return onChange(newLabel)
    }
  }

  // TODO: hard to add field to second line if the line breaks?
  return (
    <div
      id="label-creator"
      className={styles.container}
      // onBlur={onBlur}
      ref={containerRef}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.innerContainer}>
          <Target
            label={label}
            labelChanged={labelChanged}
            onChange={onChange}
            saveToDb={saveToDb}
            buttonLabel={buttonLabel}
            onApply={onApply}
          />
          <FieldList fieldLabels={fieldLabels} />
        </div>
      </DragDropContext>
    </div>
  )
}
