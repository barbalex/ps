import { useState, useEffect } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Button, Spinner } from '@fluentui/react-components'

import { TargetElements } from './TargetElements.tsx'
import { LabelElement } from '../index.tsx'
import styles from './index.module.css'

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
  // name: string
  label: LabelElement[]
  labelChanged: boolean
  onChange: () => void
  saveToDb: () => void
}

export const Target = ({ label, labelChanged, onChange, saveToDb }: Props) => {
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
    <div className={styles.container}>
      <Droppable
        droppableId="target"
        direction="horizontal"
        className={styles.droppable}
      >
        {(provided, snapshot) => (
          <div className={styles.innerContainer}>
            <div className={styles.titleContainer}>
              <h4 className={styles.title}>Label Creator</h4>
              <p className={styles.explainer}>Build your own label.</p>
              <p className={styles.explainer}>
                Pull fields here. A field's value will be used in the label.
              </p>
              <p className={styles.explainer}>Combine multiple fields.</p>
              <p className={styles.explainer}>
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
              className={styles.button}
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
