import { Droppable } from 'react-beautiful-dnd'
import styled from '@emotion/styled'

import TargetElements from './TargetElements'

const Container = styled.div`
  margin: 0;
  margin-right: 8px;
  outline: 1px dotted lightgrey;
  border-radius: 4px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-collapse: collapse;
  box-sizing: border-box;
  flex-grow: 1;
  > div {
    flex-grow: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
`
const Target = styled.div``
const TitleContainer = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  user-select: none;
`
const Title = styled.h4`
margin 0;
`
const Explainer = styled.p`
  font-size: x-small;
  margin: 0;
  color: grey;
`

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
  rowLabel: any[]
  rowState: ITable
}

const RowLabelTarget = ({ rowLabel, rowState }: Props) => {
  return (
    <Container>
      <Droppable droppableId="target" direction="horizontal">
        {(provided, snapshot) => (
          <Target ref={provided.innerRef} {...provided.droppableProps}>
            <TitleContainer>
              <Title>Datensatz-Beschriftung</Title>
              <Explainer>
                Hier bestimmen Sie, wie Datensätze beschriftet werden.
              </Explainer>
              <Explainer>
                Ziehen Sie Felder hierhin. Der jeweilige Wert des Felds wird
                dann für die Beschriftung verwendet.
              </Explainer>
              <Explainer>
                Sie können mehrere Felder kombinieren. Und mit dem
                Zeichen-Werkzeug (Trenn-)Zeichen platzieren.
              </Explainer>
            </TitleContainer>
            <TargetElements
              rowLabel={rowLabel}
              rowState={rowState}
              isDraggingOver={snapshot.isDraggingOver}
              provided={provided}
            />
          </Target>
        )}
      </Droppable>
    </Container>
  )
}

export default RowLabelTarget
