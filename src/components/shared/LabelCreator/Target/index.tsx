import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { useIntl } from 'react-intl'

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
  buttonLabel?: string
  onApply?: (label: LabelElement[]) => Promise<void> | void
}

export const Target = ({
  label,
  labelChanged,
  onChange,
  saveToDb,
  buttonLabel,
  onApply,
}: Props) => {
  const [changing, setChanging] = useState(false)
  const [prevLabelChanged, setPrevLabelChanged] = useState(labelChanged)
  const { formatMessage } = useIntl()

  // Reset changing state when labelChanged becomes false (getDerivedStateFromProps pattern)
  if (prevLabelChanged !== labelChanged) {
    setPrevLabelChanged(labelChanged)
    if (changing && !labelChanged) {
      setChanging(false)
    }
  }

  const onClickApply = async () => {
    setChanging(true)
    saveToDb()
    if (onApply) {
      await onApply(label)
    }
    setChanging(false)
  }

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
              <h4 className={styles.title}>{formatMessage({ id: 'lCrTtl', defaultMessage: 'Beschriftungs-Werkzeug' })}</h4>
              <p className={styles.explainer}>{formatMessage({ id: 'lCrBld', defaultMessage: 'Eigene Beschriftung erstellen.' })}</p>
              <p className={styles.explainer}>
                {formatMessage({ id: 'lCrPul', defaultMessage: 'Felder hierher ziehen. Der Feldwert wird in der Beschriftung verwendet.' })}
              </p>
              <p className={styles.explainer}>{formatMessage({ id: 'lCrCmb', defaultMessage: 'Mehrere Felder kombinieren.' })}</p>
              <p className={styles.explainer}>
                {formatMessage({ id: 'lCrSep', defaultMessage: 'Trenntext mit dem Trennzeichen-Werkzeug einfügen.' })}
              </p>
            </div>
            <TargetElements
              label={label}
              onChange={onChange}
              isDraggingOver={snapshot.isDraggingOver}
              provided={provided}
            />
            <Button
              onClick={onClickApply}
              className={styles.button}
              disabled={!labelChanged}
              icon={changing ? <Spinner size="tiny" /> : undefined}
            >
              {changing ? formatMessage({ id: 'lBlAplg', defaultMessage: 'Änderungen werden angewendet' }) : buttonLabel || formatMessage({ id: 'lBlApl', defaultMessage: 'Änderungen anwenden' })}
            </Button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
