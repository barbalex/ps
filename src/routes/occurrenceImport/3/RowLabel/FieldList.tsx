import { Draggable, Droppable } from 'react-beautiful-dnd'
import styled from '@emotion/styled'
import { BsArrowsMove } from 'react-icons/bs'

import { Field } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const Container = styled.div`
  margin: 0;
  outline: 1px dotted lightgrey;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-collapse: collapse;
  box-sizing: border-box;
`
const Title = styled.h5`
  margin 0;
  padding: 4px;
  padding-bottom: 0;
  user-select: none;
`
const FieldList = styled.div`
  padding: 4px;
`
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

type Props = {
  useLabels: boolean
  fields: Field[]
}

const RowLabelFieldList = ({ useLabels, fields }: Props) => (
  <Container>
    <Droppable droppableId="fieldList">
      {(provided) => (
        <FieldList ref={provided.innerRef} {...provided.droppableProps}>
          <Title>Felder</Title>
          {(fields ?? []).map((f, index) => (
            <Draggable
              key={f.id}
              draggableId={`${f.id}draggableField`}
              index={index}
            >
              {(provided, snapshot) => (
                <FieldContainer
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  isDragging={snapshot.isDragging}
                >
                  {labelFromLabeledTable({
                    object: f,
                    useLabels,
                  })}
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
          <Title>Zeichen</Title>
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
                {'Zeichen vor / nach / zwischen Feldern'}
                <FieldHandle />
              </DividerContainer>
            )}
          </Draggable>
          {provided.placeholder}
        </FieldList>
      )}
    </Droppable>
  </Container>
)

export default RowLabelFieldList
