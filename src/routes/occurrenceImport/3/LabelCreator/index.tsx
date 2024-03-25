import { useCallback, memo } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { arrayMoveImmutable } from 'array-move'

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
  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback(
    (result) => {
      // TODO:
      console.log(
        'occurrenceImport, Three, LabelCreator, onDragEnd, result:',
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
        return
      }
      if (
        destination?.droppableId === 'target' &&
        source?.droppableId === 'fieldList'
      ) {
        // user pulled from field list into target
        let newRowLabel
        if (draggableId === 'textfield') {
          newRowLabel = [
            ...label.slice(0, destination.index),
            {
              type: 'separator',
              value: '',
            },
            ...label.slice(destination.index),
          ]
        } else {
          // want to add this to rowLabel at this index
          const field = fields[source.index]
          newRowLabel = [
            ...label.slice(0, destination.index),
            {
              type: 'field',
              value: field,
            },
            ...label.slice(destination.index),
          ]
        }
        console.log(
          'occurrenceImport, Three, LabelCreator, onDragEnd, will save:',
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
        // want to remove this from the rowLabel at this index
        const clonedRowLabel = [...label]
        clonedRowLabel.splice(source.index, 1)
        const newRowLabel = clonedRowLabel.length ? clonedRowLabel : null
        console.log(
          'occurrenceImport, Three, LabelCreator, onDragEnd, will save:',
          {
            name,
            newRowLabel,
          },
        )

        onChange({ target: { value: newRowLabel, name } })
      }

      if (
        destination?.droppableId === 'target' &&
        source?.droppableId === 'target' &&
        destination.index !== source.index
      ) {
        // user moved inside target, to different index
        const newRowLabel = arrayMoveImmutable(
          label,
          source.index,
          destination.index,
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
