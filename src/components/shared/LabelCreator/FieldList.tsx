import { Draggable, Droppable } from 'react-beautiful-dnd'
import { BsArrowsMove } from 'react-icons/bs'

// import { LabelElement } from './index.tsx'
import styles from './FieldList.module.css'

// interface Props {
//   fields: string[]
//   label: LabelElement[]
// }

// only show fields not yet added to label
// TODO: build labelElements from fields
export const FieldList = ({ fieldLabels }) => (
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
              Fields{' '}
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
                      style={{
                        backgroundColor: snapshot.isDragging
                          ? 'rgba(38, 82, 37, 0.9)'
                          : 'rgba(103, 216, 101, 0.07)',
                        color: snapshot.isDragging ? 'white' : 'black',
                        // BEWARE: without this, onDragEnd doesn't fire and the dragged item does not move
                        ...provided.draggableProps.style,
                      }}
                      className={styles.fieldContainer}
                    >
                      {fieldLabel.value}
                      <BsArrowsMove className={styles.fieldHandle} />
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
            <h5 className={styles.title}>Separating text / characters</h5>
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
                  style={{
                    backgroundColor: snapshot.isDragging
                      ? 'rgba(38, 82, 37, 0.9)'
                      : 'white',
                    color: snapshot.isDragging ? 'white' : 'black',
                    // BEWARE: without this, onDragEnd doesn't fire and the dragged item does not move
                    ...provided.draggableProps.style,
                  }}
                  className={styles.dividerContainer}
                >
                  Any text
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
