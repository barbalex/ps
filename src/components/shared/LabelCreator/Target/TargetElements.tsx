import { Draggable } from 'react-beautiful-dnd'
import { BsArrowsMove } from 'react-icons/bs'

import { BetweenCharacters } from './BetweenCharacters.tsx'

const targetContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  alignContent: 'flex-start',
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

export const TargetElements = ({
  label,
  onChange,
  isDraggingOver,
  provided,
}) => (
  <div
    style={{
      ...targetContainerStyle,
      backgroundColor: isDraggingOver ? 'rgba(74,20,140,0.1)' : 'white',
      transition: 'background-color 0.2s ease',
    }}
    ref={provided.innerRef}
    {...provided.droppableProps}
  >
    {label.map((labelElement, index) => (
      <Draggable
        key={labelElement.id}
        draggableId={labelElement.id}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={elementContainerStyle}
          >
            {labelElement.type === 'field' ?
              <div
                style={{
                  ...fieldElementStyle,
                  backgroundColor:
                    snapshot.isDragging ?
                      'rgba(38, 82, 37, 0.9)'
                    : 'rgba(103, 216, 101, 0.07)',
                  color: snapshot.isDragging ? 'white' : 'black',
                  ...provided.draggableProps.style,
                }}
              >
                {labelElement.value}
                <BsArrowsMove style={fieldHandleStyle} />
              </div>
            : <BetweenCharacters
                el={labelElement}
                label={label}
                onChange={onChange}
                index={index}
                snapshot={snapshot}
                provided={provided}
              >
                <BsArrowsMove style={fieldHandleStyle} />
              </BetweenCharacters>
            }
          </div>
        )}
      </Draggable>
    ))}
    {provided.placeholder}
  </div>
)
