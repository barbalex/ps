import { Draggable, Droppable } from 'react-beautiful-dnd'
import styled from '@emotion/styled'
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
const FieldContainer = styled.div`
  position: relative;
  padding: 4px 7px;
  border: 1px solid lightgrey;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: x-small;
  line-height: 16.6px;
  user-select: none;
  background-color: ${(props) =>
    props.isDragging ? 'rgb(74, 20, 140)' : 'white'};
  transition: background-color 0.2s ease;
  color: ${(props) => (props.isDragging ? 'white' : 'black')};
  transition: color 0.2s ease;
`
const FieldHandle = styled(BsArrowsMove)`
  color: #989898;
  position: absolute;
  top: -6.8px;
  left: -2px;
  transform: rotate(90deg);
  height: 1.2em;
  width: 1.2em;
`
const DividerContainer = styled(FieldContainer)`
  margin-top: 4px;
  position: relative;
`
const Explainer = styled.p`
  font-size: x-small;
  margin: 0;
  padding: 0 4px;
  color: grey;
`

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
          <h5 style={titleStyle}>Felder</h5>
          {(fields ?? []).map((field, index) => (
            <Draggable
              key={field.id}
              draggableId={`${field.id}draggableField`}
              index={index}
            >
              {(provided, snapshot) => (
                <FieldContainer
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  isDragging={snapshot.isDragging}
                >
                  {field}
                  <FieldHandle />
                </FieldContainer>
              )}
            </Draggable>
          ))}
          {(fields ?? []).length === 0 && (
            <Explainer>
              Sie müssen Felder erzeugen, um die Datensatz-Beschriftung zu
              bestimmen.
            </Explainer>
          )}
          <h5 style={titleStyle}>Zeichen</h5>
          <Draggable
            key="textfield"
            draggableId="textfield"
            index={fields.length}
          >
            {(provided) => (
              <DividerContainer
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                Any text
                <FieldHandle />
              </DividerContainer>
            )}
          </Draggable>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
)
