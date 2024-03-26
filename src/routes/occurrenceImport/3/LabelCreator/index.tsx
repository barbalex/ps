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
  console.warn('occurrenceImport, Three, LabelCreator 1, label:', label)

  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback(
    (result) => {
      // TODO:
      console.warn(
        'occurrenceImport, Three, LabelCreator 2, onDragEnd, result:',
        result,
      )
      const { destination, source, draggableId } = result
      // if (!destination) {
      //   return
      // }
      if (
        destination?.droppableId === source?.droppableId &&
        destination?.index === source?.index
      ) {
        // user moved something inside same droppable without changing index
        console.warn(
          'occurrenceImport, Three, LabelCreator 3, onDragEnd: user moved something inside same droppable without changing index',
        )
        return
      }
      if (
        destination?.droppableId === 'target' &&
        source?.droppableId === 'fieldList'
      ) {
        // user pulled from field list into target
        console.warn(
          'occurrenceImport, Three, LabelCreator 4, onDragEnd: user moved from field list to target',
        )
        let newRowLabel
        if (draggableId === 'separator') {
          console.warn(
            'occurrenceImport, Three, LabelCreator 5, onDragEnd: user moved a separator from field list to target',
          )
          newRowLabel = [
            ...label.slice(0, destination.index),
            {
              type: 'separator',
              value: '',
              id: uuidv7(),
            },
            ...label.slice(destination.index),
          ]
        } else {
          console.warn(
            'occurrenceImport, Three, LabelCreator 6, onDragEnd: user moved a field from field list to target',
          )
          // want to add this to rowLabel at this index
          const field = fields[source.index]
          newRowLabel = [
            ...label.slice(0, destination.index),
            {
              type: 'field',
              value: field,
              id: uuidv7(),
            },
            ...label.slice(destination.index),
          ]
        }
        console.warn(
          'occurrenceImport, Three, LabelCreator 7, onDragEnd, will save:',
          {
            name,
            newRowLabel,
          },
        )
        onChange({ target: { value: newRowLabel, name } })
      }
      if (
        // not checking destination - user can simply pull out of target
        source?.droppableId === 'target'
      ) {
        // user pulled from target anywhere outside
        console.warn(
          'occurrenceImport, Three, LabelCreator 8, onDragEnd: user moved from target to anywhere outside',
        )
        // want to remove this from the rowLabel at this index
        const clonedLabel = [...label]
        clonedLabel.splice(source.index, 1)
        const newLabel = clonedLabel.length ? clonedLabel : null
        console.warn(
          'occurrenceImport, Three, LabelCreator 9, onDragEnd, will save:',
          {
            name,
            newLabel,
          },
        )

        onChange({ target: { value: newLabel, name } })
      }

      if (
        destination?.droppableId === 'target' &&
        source?.droppableId === 'target' &&
        destination.index !== source.index
      ) {
        // user moved inside target, to different index
        console.warn(
          'occurrenceImport, Three, LabelCreator 10, onDragEnd: user moved inside target, to different index',
        )
        const newRowLabel = arrayMoveImmutable(
          label,
          source.index,
          destination.index,
        )
        console.warn(
          'occurrenceImport, Three, LabelCreator 11, onDragEnd, will save:',
          {
            name,
            newRowLabel,
          },
        )
        onChange({ target: { value: newRowLabel, name } })
      }
    },
    [fields, label, name, onChange],
  )

  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={innerContainerStyle}>
          <Target name={name} label={label} onChange={onChange} />
          <FieldList fields={fields} />
        </div>
      </DragDropContext>
    </div>
  )
})
