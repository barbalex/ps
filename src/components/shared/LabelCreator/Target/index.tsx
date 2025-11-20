import { useState, useEffect } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { Button, Spinner } from '@fluentui/react-components'

import { TargetElements } from './TargetElements.tsx'
import { LabelElement } from '../index.tsx'

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
  lineHeight: '1.3em',
}
const innerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
}
const buttonStyle = {
  margin: 8,
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
  labelChanged: boolean
  onChange: () => void
  saveToDb: () => void
}

export const Target = ({ label, labelChanged, onChange, saveToDb }) => {
  // TODO: on apply changes: set loading until labelChanged is false
  const [changing, setChanging] = useState(false)
  const onClick = () => {
    setChanging(true)
    saveToDb()
  }

  useEffect(() => {
    if (changing && !labelChanged) setChanging(false)
  }, [changing, labelChanged])

  return (
    <div style={containerStyle}>
      <Droppable
        droppableId="target"
        direction="horizontal"
        style={droppableStyle}
      >
        {(provided, snapshot) => (
          <div style={innerContainerStyle}>
            <div style={titleContainerStyle}>
              <h4 style={titleStyle}>Label Creator</h4>
              <p style={explainerStyle}>Build your own label.</p>
              <p style={explainerStyle}>
                Pull fields here. A field's value will be used in the label.
              </p>
              <p style={explainerStyle}>Combine multiple fields.</p>
              <p style={explainerStyle}>
                Place separating text using the separator tool.
              </p>
            </div>
            <TargetElements
              label={label}
              onChange={onChange}
              isDraggingOver={snapshot.isDraggingOver}
              provided={provided}
            />
            <Button
              onClick={onClick}
              style={buttonStyle}
              disabled={!labelChanged}
              icon={changing ? <Spinner size="tiny" /> : undefined}
            >
              {changing ? 'Applying changes' : 'Apply changes'}
            </Button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
