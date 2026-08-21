import { useState, useEffect, useRef } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { uuidv7 } from '@kripod/uuidv7'
import { isEqual } from 'es-toolkit'

import { FieldList } from './FieldList.tsx'
import { Target } from './Target/index.tsx'
import { isLabelCreatorData } from './dnd.ts'
import styles from './index.module.css'

export interface LabelElement {
  type: 'field' | 'separator'
  value: string
  id?: string
}

interface Props {
  label: LabelElement[]
  fields: string[]
  name: string
  onChange: (event: {
    target: { value: LabelElement[] | null; name: string }
  }) => void
  buttonLabel?: string
  onApply?: (label: LabelElement[]) => Promise<void> | void
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
  const [label, setLabel] = useState<LabelElement[] | null>(() =>
    structuredClone(labelPassed ?? []),
  )

  // Reset local state when prop changes (getDerivedStateFromProps pattern)
  if (!isEqual(labelProp, labelPassed)) {
    setLabelProp(labelPassed)
    setLabel(structuredClone(labelPassed ?? []))
  }

  const onChange = (newLabel: LabelElement[] | null) => setLabel(newLabel)

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
  const fieldLabels = unusedFields.map(
    (field): { type: 'field'; value: string; id: string } => ({
      type: 'field',
      value: field,
      id: uuidv7(),
    }),
  )

  // Isolated instances of this component from one another
  const [instanceId] = useState(() => Symbol('instance-id'))

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return (
          isLabelCreatorData(source.data) &&
          source.data.instanceId === instanceId
        )
      },
      onDrop({ location, source }) {
        const sourceData = source.data as {
          kind?: 'field' | 'separator' | 'element'
          index?: number
          id?: string
          instanceId?: symbol
        } & Record<string | symbol, unknown>
        if (!isLabelCreatorData(sourceData)) return

        const isElementSource = sourceData.kind === 'element'
        const sourceIndex = sourceData.index ?? -1
        if (isElementSource && sourceIndex < 0) return

        const currentLabel = label ?? []

        const removeFromLabel = () => {
          // user pulled from target anywhere outside
          // remove the label element at this index
          const clonedLabel = [...currentLabel]
          clonedLabel.splice(sourceIndex, 1)
          const newLabel = clonedLabel.length ? clonedLabel : null
          return onChange(newLabel)
        }

        const insertIntoLabel = (insertionIndex: number) => {
          let newLabel: LabelElement[]
          if (sourceData.kind === 'separator') {
            newLabel = [
              ...currentLabel.slice(0, insertionIndex),
              {
                type: 'separator' as const,
                value: '',
                id: uuidv7(),
              },
              ...currentLabel.slice(insertionIndex),
            ]
            // TODO: focus the field
          } else {
            const fieldLabel = fieldLabels.find((el) => el.id === sourceData.id)
            if (!fieldLabel) return
            newLabel = [
              ...currentLabel.slice(0, insertionIndex),
              // clone the label
              { ...fieldLabel },
              ...currentLabel.slice(insertionIndex),
            ]
          }
          return onChange(newLabel)
        }

        const target = location.current.dropTargets[0]
        if (!target) {
          if (isElementSource) {
            removeFromLabel()
          }
          return
        }

        const targetData = target.data

        if (targetData.targetContainer) {
          // dropped on the target's empty space: append at the end
          if (isElementSource) {
            const finishIndex = currentLabel.length - 1
            if (finishIndex !== sourceIndex) {
              onChange(
                reorder({
                  list: currentLabel,
                  startIndex: sourceIndex,
                  finishIndex,
                }),
              )
            }
          } else {
            insertIntoLabel(currentLabel.length)
          }
          return
        }

        const indexOfTarget = targetData.index
        if (typeof indexOfTarget !== 'number') return
        const closestEdge = extractClosestEdge(targetData)

        if (isElementSource) {
          // user moved an element inside target
          const finishIndex = getReorderDestinationIndex({
            startIndex: sourceIndex,
            indexOfTarget,
            closestEdgeOfTarget: closestEdge,
            axis: 'horizontal',
          })
          if (finishIndex === sourceIndex) {
            // do nothing
            return
          }
          return onChange(
            reorder({
              list: currentLabel,
              startIndex: sourceIndex,
              finishIndex,
            }),
          )
        }

        // user pulled from field list into target
        // so need to add this to the label at the insertion index
        const insertionIndex =
          closestEdge === 'left' ? indexOfTarget : indexOfTarget + 1

        return insertIntoLabel(insertionIndex)
      },
    })
  }, [fieldLabels, instanceId, label])

  // TODO: hard to add field to second line if the line breaks?
  return (
    <div
      id="label-creator"
      className={styles.container}
      // onBlur={onBlur}
      ref={containerRef}
    >
      <div className={styles.innerContainer}>
        <Target
          label={label ?? []}
          labelChanged={labelChanged}
          onChange={onChange}
          saveToDb={saveToDb}
          buttonLabel={buttonLabel}
          onApply={onApply}
          instanceId={instanceId}
        />
        <FieldList fieldLabels={fieldLabels} instanceId={instanceId} />
      </div>
    </div>
  )
}
