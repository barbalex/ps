import { memo } from 'react'
import { Droppable } from 'react-beautiful-dnd'

import { TargetElements } from './TargetElements'
import { LabelElement } from '..'

const containerStyle = {
  margin: 0,
  marginRight: 8,
  outline: '1px dotted lightgrey',
  borderRadius: 4,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
  flexGrow: 1,
}
// was inside container:
// > div {
//   flex-grow: 1;
//   height: 100%;
//   width: 100%;
//   display: flex;
//   flex-direction: column;
// }
const droppableStyle = {
  flexGrow: 1,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}
const titleContainerStyle = {
  padding: 8,
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 0,
  userSelect: 'none',
}
const titleStyle = {
  margin: 0,
}
const explainerStyle = {
  fontSize: 'x-small',
  margin: 0,
  color: 'grey',
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

interface Props {
  name: string
  label: LabelElement[]
  onChange: () => void
}

export const Target = memo(({ label, onChange }: Props) => (
  <div style={containerStyle}>
    <Droppable
      droppableId="target"
      direction="horizontal"
      style={droppableStyle}
    >
      {(provided, snapshot) => (
        <div>
          <div style={titleContainerStyle}>
            <h4 style={titleStyle}>Label Creator</h4>
            <p style={explainerStyle}>Build your own label.</p>
            <p style={explainerStyle}>
              Pull fields here. The field's value will be used in the label.
            </p>
            <p style={explainerStyle}>
              You can combine multiple fields. And place separating text using
              the separator tool.
            </p>
          </div>
          <TargetElements
            label={label}
            onChange={onChange}
            isDraggingOver={snapshot.isDraggingOver}
            provided={provided}
          />
        </div>
      )}
    </Droppable>
  </div>
))
