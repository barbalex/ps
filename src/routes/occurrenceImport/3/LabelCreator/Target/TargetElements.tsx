import { memo } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { BsArrowsMove } from 'react-icons/bs'

import { BetweenCharacters } from './BetweenCharacters'
import { LabelElement } from '..'

const targetContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  flexGrow: 1,
  minHeight: '42px',
  padding: '8px',
  transition: 'background-color 0.2s ease',
  userSelect: 'none',
}
const fieldElementStyle = {
  padding: '8.5px 14px',
  backgroundColor: 'rgba(103, 216, 101, 0.07)',
  border: '1px solid lightgrey',
  marginRight: 6,
  marginTop: 8,
  borderRadius: 4,
  fontSize: 'small',
  lineHeight: '16.6px',
  userSelect: 'none',
  position: 'relative',
}
const fieldHandleStyle = {
  color: '#989898',
  position: 'absolute',
  top: 0,
  left: 0,
  height: '0.95em',
  width: '0.95em',
}
const elementContainerStyle = {
  display: 'flex',
}

interface Props {
  label: LabelElement[]
  name: string
  onChange: () => void
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

export const TargetElements = memo(
  ({ label, name, onChange, isDraggingOver, provided }: Props) => {
    return (
      <div
        style={{
          ...targetContainerStyle,
          backgroundColor: isDraggingOver ? 'rgba(74,20,140,0.1)' : 'white',
        }}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {label.map((el, index) => (
          <Draggable
            key={el.id}
            draggableId={el.id}
            index={index}
          >
            {(provided) => (
              <div
                key={`${el.value}/${index}`}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                style={elementContainerStyle}
              >
                {el.type === 'field' ? (
                  <div style={fieldElementStyle}>
                    {el.value}
                    <BsArrowsMove style={fieldHandleStyle} />
                  </div>
                ) : (
                  <BetweenCharacters
                    el={el}
                    label={label}
                    name={name}
                    onChange={onChange}
                    index={index}
                  >
                    <BsArrowsMove style={fieldHandleStyle} />
                  </BetweenCharacters>
                )}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )
  },
)
