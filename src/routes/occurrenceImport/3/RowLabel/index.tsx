import { useCallback, useMemo } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from '@emotion/styled'
import { arrayMoveImmutable } from 'array-move'

import { Field } from '../../../../dexieClient'
import FieldList from './FieldList'
import Target from './Target'

const Container = styled.div`
  outline: 1px solid lightgrey;
  border-radius: 4px;
  border-collapse: collapse;
  box-sizing: border-box;
`
const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

/**
 * Have two versions:
 * 1. editing
 *    - (horizontal?) list of draggable fields
 *    - text field element to drag between field elements and input some text
 *    - drop area, horizontally sortable
 *      edit creates array of: {field: field_id, text: 'field', index: 1}
 *      or
 *         have a table 'table_row_label_parts' with fields: table_id, sort, type, value
 *         and in class Table a get function to fetch the table's row label or use https://github.com/ignasbernotas/dexie-relationships
 *         No, because: new table needs to be policied and synced. Much easier to have a jsonb field in already synced table
 * 2. presentation: only the drop area
 * 3. remind user to first define the fields
 */
interface labelElement {
  type: 'field' | 'separator'
  field: string
}
interface Props {
  label: labelElement[]
  fields: string[]
  onChange: () => void
}

export const LabelCreator = ({ label, fields, name, onChange }: Props) => {
  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback(
    (result) => {
      // TODO:
      // console.log('onDragEnd, result:', result)
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
              index: destination.index,
              text: '',
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
              index: destination.index,
              value: field,
            },
            ...label.slice(destination.index),
          ]
        }
        onChange({ target: { [name]: newRowLabel } })
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

        onChange({ target: { [name]: newRowLabel } })
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
        onChange({ target: { [name]: newRowLabel } })
      }
    },
    [fields, label, name, onChange],
  )

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEnd}>
        <InnerContainer>
          <Target rowLabel={label} rowState={rowState} />
          <FieldList useLabels={useLabels} fields={fields} />
        </InnerContainer>
      </DragDropContext>
    </Container>
  )
}
