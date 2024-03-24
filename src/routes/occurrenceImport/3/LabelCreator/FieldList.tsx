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
const fieldHandleStyle = {
  color: '#989898',
  position: 'absolute',
  top: -6.8,
  left: -2,
  transform: 'rotate(90deg)',
  height: '1.2em',
  width: '1.2em',
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
                      : 'white',
                    color: snapshot.isDragging ? 'white' : 'black',
                  }}
                >
                  {field}
                  <BsArrowsMove style={fieldHandleStyle} />
                </div>
              )}
            </Draggable>
          ))}
          <h5 style={titleStyle}>Separator (any Text)</h5>
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
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
)
