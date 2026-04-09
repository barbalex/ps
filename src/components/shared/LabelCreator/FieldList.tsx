import { Draggable, Droppable } from '@hello-pangea/dnd'
import { BsArrowsMove } from 'react-icons/bs'
import { useIntl } from 'react-intl'

// import { LabelElement } from './index.tsx'
import styles from './FieldList.module.css'

// interface Props {
//   fields: string[]
//   label: LabelElement[]
// }

// only show fields not yet added to label
// TODO: build labelElements from fields
export const FieldList = ({ fieldLabels }) => {
  const { formatMessage } = useIntl()

  return (
    <div className={styles.container}>
      <Droppable droppableId="fieldList">
        {(provided) => (
          <>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.fieldList}
            >
              <h5 className={styles.title}>
                {formatMessage({ id: 'fLdTtl', defaultMessage: 'Felder' })}{' '}
                <span className={styles.titleSpan}>({fieldLabels.length})</span>
              </h5>
              <div className={styles.fieldsList}>
                {(fieldLabels ?? []).map((fieldLabel, index) => (
                  <Draggable
                    key={fieldLabel.id}
                    draggableId={fieldLabel.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        style={provided.draggableProps.style}
                        className={`${styles.fieldContainer}${snapshot.isDragging ? ` ${styles.fieldContainerDragging}` : ''}`}
                      >
                        {fieldLabel.value}
                        <BsArrowsMove className={styles.fieldHandle} />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              <h5 className={styles.title}>
                {formatMessage({
                  id: 'fLdSep',
                  defaultMessage: 'Trenntext / Zeichen',
                })}
              </h5>
              {/* TODO: this draggable needs a uuidv7 draggableId that changes after every addition of a separator */}
              <Draggable
                key="separator"
                draggableId="separator"
                index={fieldLabels.length}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    style={provided.draggableProps.style}
                    className={`${styles.dividerContainer}${snapshot.isDragging ? ` ${styles.dividerContainerDragging}` : ''}`}
                  >
                    {formatMessage({
                      id: 'fLdAny',
                      defaultMessage: 'Beliebiger Text',
                    })}
                    <BsArrowsMove className={styles.fieldHandle} />
                  </div>
                )}
              </Draggable>
            </div>
            {provided.placeholder}
          </>
        )}
      </Droppable>
    </div>
  )
}
