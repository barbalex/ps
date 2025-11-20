import { Draggable, Droppable } from 'react-beautiful-dnd'
import { BsArrowsMove } from 'react-icons/bs'

// import { LabelElement } from './index.tsx'

const containerStyle = {
  margin: 0,
  outline: '1px dotted lightgrey',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
  maxWidth: 140,
}
const titleStyle = {
  margin: 0,
  padding: 4,
  paddingBottom: 0,
  userSelect: 'none',
  whiteSpace: 'normal',
  lineHeight: '1.2em',
}
const fieldListStyle = {
  padding: 4,
}
const fieldContainerStyle = {
  position: 'relative',
  padding: '4px 7px',
  border: '1px solid lightgrey',
  marginBottom: 8,
  borderRadius: 4,
  fontSize: 'x-small',
  lineHeight: '1.2em',
  minHeight: '1.6em',
  userSelect: 'none',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  overflowWrap: 'anywhere',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}
const dividerContainerStyle = {
  ...fieldContainerStyle,
  marginTop: 4,
  position: 'relative',
}
const fieldsListStyle = {
  maxHeight: 300,
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  overflowX: 'hidden',
}
const fieldHandleStyle = {
  color: '#989898',
  position: 'absolute',
  top: 0,
  left: 0,
  height: '0.8em',
  width: '0.8em',
}
const titleSpanStyle = {
  fontWeight: 'normal',
}

// interface Props {
//   fields: string[]
//   label: LabelElement[]
// }

// only show fields not yet added to label
// TODO: build labelElements from fields
export const FieldList = ({ fieldLabels }) => (
  <div style={containerStyle}>
    <Droppable droppableId="fieldList">
      {(provided) => (
        <>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={fieldListStyle}
          >
            <h5 style={titleStyle}>
              Fields <span style={titleSpanStyle}>({fieldLabels.length})</span>
            </h5>
            <div style={fieldsListStyle}>
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
                        ...fieldContainerStyle,
                        backgroundColor:
                          snapshot.isDragging ?
                            'rgba(38, 82, 37, 0.9)'
                          : 'rgba(103, 216, 101, 0.07)',
                        color: snapshot.isDragging ? 'white' : 'black',
                        // BEWARE: without this, onDragEnd doesn't fire and the dragged item does not move
                        ...provided.draggableProps.style,
                      }}
                    >
                      {fieldLabel.value}
                      <BsArrowsMove style={fieldHandleStyle} />
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
            <h5 style={titleStyle}>Separating text / characters</h5>
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
                    ...dividerContainerStyle,
                    backgroundColor:
                      snapshot.isDragging ? 'rgba(38, 82, 37, 0.9)' : 'white',
                    color: snapshot.isDragging ? 'white' : 'black',
                    // BEWARE: without this, onDragEnd doesn't fire and the dragged item does not move
                    ...provided.draggableProps.style,
                  }}
                >
                  Any text
                  <BsArrowsMove style={fieldHandleStyle} />
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
