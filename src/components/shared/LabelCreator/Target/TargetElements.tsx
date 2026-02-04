import { Draggable } from '@hello-pangea/dnd'
import { BsArrowsMove } from 'react-icons/bs'

import { BetweenCharacters } from './BetweenCharacters.tsx'
import styles from './TargetElements.module.css'

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
      backgroundColor: isDraggingOver ? 'rgba(74,20,140,0.1)' : 'white',
    }}
    className={styles.targetContainer}
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
            className={styles.elementContainer}
          >
            {labelElement.type === 'field' ?
              <div
                style={{
                  backgroundColor:
                    snapshot.isDragging ?
                      'rgba(38, 82, 37, 0.9)'
                    : 'rgba(103, 216, 101, 0.07)',
                  color: snapshot.isDragging ? 'white' : 'black',
                  ...provided.draggableProps.style,
                }}
                className={styles.fieldElement}
              >
                {labelElement.value}
                <BsArrowsMove className={styles.fieldHandle} />
              </div>
            : <BetweenCharacters
                el={labelElement}
                label={label}
                onChange={onChange}
                index={index}
                snapshot={snapshot}
                provided={provided}
              >
                <BsArrowsMove className={styles.fieldHandle} />
              </BetweenCharacters>
            }
          </div>
        )}
      </Draggable>
    ))}
    {provided.placeholder}
  </div>
)
