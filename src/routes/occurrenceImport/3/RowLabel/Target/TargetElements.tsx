import { Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from '@emotion/styled'
import { BsArrowsMove } from 'react-icons/bs'

import { dexie, Field, ITable } from '../../../../../dexieClient'
import BetweenCharactersElement from './BetweenCharacters'

const TargetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-grow: 1;
  min-height: 42px;
  padding: 8px;
  background-color: ${(props) =>
    props.isDraggingOver ? 'rgba(74,20,140,0.1)' : 'white'};
  transition: background-color 0.2s ease;
`
const FieldElement = styled.div`
  padding: 8.5px 14px;
  border: 1px solid lightgrey;
  margin-right: 6px;
  margin-top: 8px;
  border-radius: 4px;
  font-size: small;
  line-height: 16.6px;
  user-select: none;
  position: relative;
`
const FieldHandle = styled(BsArrowsMove)`
  color: #989898;
  position: absolute;
  top: -8.5px;
  left: -2px;
  height: 1.2em;
  width: 1.2em;
  font-weight: bold;
`
const BetweenCharactersHandle = styled(BsArrowsMove)`
  color: #989898;
  position: absolute;
  top: 0.7px;
  left: -1.5px;
  height: 0.95em;
  width: 0.95em;
`
const ElementContainer = styled.div`
  display: flex;
`

export interface TargetElement {
  type: 'field' | 'text'
  field?: Field
  text?: string
  index: number
}

interface Props {
  rowLabel: any[]
  rowState: ITable
  isDraggingOver: boolean
  provided: DroppableProvided
}

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

const RowLabelTarget = ({
  rowLabel,
  rowState,
  isDraggingOver,
  provided,
}: Props) => {
  const { tableId } = useParams()

  // rowLabel: array of {field: id, type: 'field'},{text, type: 'text'}
  const targetFieldIds: string[] = rowLabel
    .filter((el) => el.type === 'field')
    .map((el) => el.field)
  const targetFields: Field[] =
    useLiveQuery(
      async () =>
        await dexie.fields.where('id').anyOf(targetFieldIds).toArray(),
      [tableId, rowLabel],
    ) ?? []

  const targetElements: TargetElement[] = rowLabel.map((el) => ({
    type: el.type,
    field: el.field ? targetFields.find((f) => f.id === el.field) : undefined,
    text: el.text,
    index: el.index,
  }))

  return (
    <TargetContainer isDraggingOver={isDraggingOver}>
      {targetElements.map((el, index) => (
        <Draggable
          key={el.field?.id ?? el.text ?? index}
          draggableId={`${el.field?.id ?? el.text ?? index}draggableTarget`}
          index={index}
        >
          {(provided) => (
            <ElementContainer
              key={el.field?.id ?? el.text ?? index}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              {/* <Handle /> */}
              {el.type === 'field' ? (
                <FieldElement>
                  {`${
                    el.field?.name ?? el.text ?? 'neither fieldName nor text'
                  }`}
                  <FieldHandle />
                </FieldElement>
              ) : (
                <BetweenCharactersElement
                  el={el}
                  rowState={rowState}
                  index={index}
                >
                  <BetweenCharactersHandle />
                </BetweenCharactersElement>
              )}
            </ElementContainer>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </TargetContainer>
  )
}

export default RowLabelTarget
