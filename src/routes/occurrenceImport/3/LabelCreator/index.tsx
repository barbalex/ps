import { useCallback, memo } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { arrayMoveImmutable } from 'array-move'
import { uuidv7 } from '@kripod/uuidv7'

import { FieldList } from './FieldList'
import { Target } from './Target'

const containerStyle = {
  outline: '1px solid lightgrey',
  borderRadius: 4,
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
}
const innerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
}

/**
 * Have two versions:
 * 1. editing
 *    - list of draggable fields
 *    - text field element to drag between field elements and input some text
 *    - drop area, horizontally sortable
 *      edit creates array of: {type: 'field'|'separator', value: value}
 * 2. presentation: only the drop area
 */
export interface LabelElement {
  type: 'field' | 'separator'
  value: string
}
interface Props {
  label: LabelElement[]
  fields: string[]
  name: string
  onChange: () => void
}

export const LabelCreator = memo(({ label, fields, name, onChange }: Props) => {
  console.log('occurrenceImport, Three, LabelCreator 1, label:', label)

  const fieldLabelElements = label.filter((el) => el.type === 'field')
  const fieldLabelValues = fieldLabelElements.map((el) => el.value)
  const unusedFields = fields.filter(
    (field) => !fieldLabelValues.includes(field),
  )
  const fieldLabels = unusedFields.map((field) => ({
    type: 'field',
    value: field,
    id: uuidv7(),
  }))

  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback(
    (result) => {
      // TODO:
      console.log(
        'occurrenceImport, Three, LabelCreator 2, onDragEnd, result:',
        result,
      )

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
        console.log(
          'occurrenceImport, Three, LabelCreator 3, onDragEnd: user moved something inside same droppable without changing index',
        )
        return
      }
      if (
        destination?.droppableId === 'target' &&
        source.droppableId === 'fieldList'
      ) {
        // user pulled from field list into target
        // so need to add this to the label at the destination index
        console.log(
          'occurrenceImport, Three, LabelCreator 4, onDragEnd: user moved from field list to target',
        )
        let newLabel
        if (draggableId === 'separator') {
          console.log(
            'occurrenceImport, Three, LabelCreator 5, onDragEnd: user moved a separator from field list to target',
          )
          newLabel = [
            ...label.slice(0, destination.index),
            {
              type: 'separator',
              value: '',
              id: uuidv7(),
            },
            ...label.slice(destination.index),
          ]
        } else {
          console.log(
            'occurrenceImport, Three, LabelCreator 6, onDragEnd: user moved a field from field list to target',
          )
          const fieldLabel = fieldLabels.find((el) => el.id === draggableId)
          newLabel = [
            ...label.slice(0, destination.index),
            // clone the label
            { ...fieldLabel },
            ...label.slice(destination.index),
          ]
        }
        console.log(
          'occurrenceImport, Three, LabelCreator 7, onDragEnd, will save:',
          {
            name,
            newLabel,
          },
        )
        onChange({ target: { value: newLabel, name } })
        return
      }

      if (
        destination?.droppableId === 'target' &&
        source.droppableId === 'target' &&
        destination?.index !== source.index
      ) {
        // user moved inside target, to different index
        console.log(
          'occurrenceImport, Three, LabelCreator 8, onDragEnd: user moved inside target, to different index',
        )
        const newLabel = arrayMoveImmutable(
          label,
          source.index,
          destination.index,
        )
        console.log(
          'occurrenceImport, Three, LabelCreator 9, onDragEnd, will save:',
          {
            name,
            newLabel,
          },
        )
        onChange({ target: { value: newLabel, name } })
        return
      }

      if (
        source.droppableId === 'target' &&
        (!destination || destination.droppableId !== 'target')
      ) {
        // user pulled from target anywhere outside
        console.log(
          'occurrenceImport, Three, LabelCreator 10, onDragEnd: user moved from target to anywhere outside',
        )
        // remove the label element at this index
        const clonedLabel = [...label]
        clonedLabel.splice(source.index, 1)
        const newLabel = clonedLabel.length ? clonedLabel : null
        console.log(
          'occurrenceImport, Three, LabelCreator 11, onDragEnd, will save:',
          {
            name,
            newLabel,
          },
        )

        onChange({ target: { value: newLabel, name } })
      }
    },
    [fieldLabels, label, name, onChange],
  )

  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={innerContainerStyle}>
          <Target
            name={name}
            label={label}
            fieldLabels={fieldLabels}
            onChange={onChange}
          />
          <FieldList fieldLabels={fieldLabels} />
        </div>
      </DragDropContext>
    </div>
  )
})
