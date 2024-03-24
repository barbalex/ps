import { Draggable, Droppable } from 'react-beautiful-dnd'
import { BsArrowsMove } from 'react-icons/bs'

const containerStyle = {
  margin: 0,
  outline: '1px dotted lightgrey',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
}
const titleStyle = {
  margin: 0,
  padding: 4,
  paddingBottom: 0,
  userSelect: 'none',
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
  lineHeight: '16.6px',
  userSelect: 'none',
  transition: 'background-color 0.2s ease, color 0.2s ease',
}
const dividerContainerStyle = {
  ...fieldContainerStyle,
  marginTop: 4,
  position: 'relative',
}
const fieldsListStyle = {
  maxHeight: 300,
  overflowY: 'auto',
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

interface Props {
  fields: string[]
}

export const FieldList = ({ fields }: Props) => (
  <div style={containerStyle}>
    <Droppable droppableId="fieldList">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={fieldListStyle}
        >
          <h5 style={titleStyle}>Fields</h5>
          <div style={fieldsListStyle}>
            {(fields ?? []).map((field, index) => (
              <Draggable key={field} draggableId={field} index={index}>
                {(provided, snapshot) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    style={{
                      ...fieldContainerStyle,
                      backgroundColor: snapshot.isDragging
                        ? 'rgb(74, 20, 140)'
                        : 'rgba(103, 216, 101, 0.07)',
                      color: snapshot.isDragging ? 'white' : 'black',
                    }}
                  >
                    {field}
                    <BsArrowsMove style={fieldHandleStyle} />
                  </div>
                )}
              </Draggable>
            ))}
          </div>
          <h5 style={titleStyle}>Separating text/characters</h5>
          <Draggable
            key="textfield"
            draggableId="textfield"
            index={fields.length}
          >
            {(provided, snapshot) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                style={{
                  ...dividerContainerStyle,
                  backgroundColor: snapshot.isDragging
                    ? 'rgb(74, 20, 140)'
                    : 'white',
                  color: snapshot.isDragging ? 'white' : 'black',
                }}
              >
                Any text
                <BsArrowsMove style={fieldHandleStyle} />
              </div>
            )}
          </Draggable>
        </div>
      )}
    </Droppable>
  </div>
)
