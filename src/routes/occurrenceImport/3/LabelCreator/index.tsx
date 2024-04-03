import { useCallback, memo, useState, useEffect } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { arrayMoveImmutable } from 'array-move'
import { uuidv7 } from '@kripod/uuidv7'

import { FieldList } from './FieldList'
import { Target } from './Target'

const containerStyle = {
  outline: '1px solid lightgrey',
  borderRadius: 4,
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
}
const innerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
}

export interface LabelElement {
  type: 'field' | 'separator'
  value: string
}
interface Props {
  label: LabelElement[]
  fields: string[]
  name: string
  onChange: () => void
}

export const LabelCreator = memo(
  ({ label, fields, name, onChange: onChangePassed }: Props) => {
    console.log('occurrenceImport, Three, LabelCreator 1, label:', label)

    // TODO: do I need a useEffect to update the state when the props change?
    const [state, setState] = useState({ label, fields })
    const onBlur = useCallback(
      (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          // focus left the container
          // https://github.com/facebook/react/issues/6410#issuecomment-671915381
          console.log(
            'occurrenceImport, Three, LabelCreator, saving label state on blur',
            state.label,
          )
          onChangePassed({ target: { value: state.label, name } })
        }
      },
      [name, onChangePassed, state],
    )
    const onChange = useCallback(
      (newLabel) => {
        console.log(
          'occurrenceImport, Three, LabelCreator, onChange, newLabel:',
          newLabel,
        )
        setState((prevState) => ({ ...prevState, label: newLabel }))
      },
      [setState],
    )

    useEffect(() => {
      window.onbeforeunload = () => {
        // save any data changed before closing tab or browser
        // only works if updateOnServer can run without waiting for an async process
        // https://stackoverflow.com/questions/36379155/wait-for-promises-in-onbeforeunload
        // which is why rowState.current is needed (instead of getting up to date row)
        console.log(
          'occurrenceImport, Three, LabelCreator, saving label state on before unload:',
          state.label,
        )
        onChangePassed({ target: { value: state.label, name } })
        // do not return - otherwise user is dialogued, and that does not help the saving
      }
    }, [name, onChangePassed, state.label])

    const fieldLabelElements = state.label.filter((el) => el.type === 'field')
    const fieldLabelValues = fieldLabelElements.map((el) => el.value)
    const unusedFields = state.fields.filter(
      (field) => !fieldLabelValues.includes(field),
    )
    const fieldLabels = unusedFields.map((field) => ({
      type: 'field',
      value: field,
      id: uuidv7(),
    }))

    const onDragEnd = useCallback(
      (result) => {
        const { destination, source, draggableId } = result

        if (
          destination?.droppableId === source.droppableId &&
          destination?.index === source.index
        ) {
          // do nothing
          return
        }

        if (
          destination?.droppableId === source.droppableId &&
          destination?.index === source.index
        ) {
          // user moved something inside same droppable without changing index
          // do nothing
          return
        }
        if (
          destination?.droppableId === 'target' &&
          source.droppableId === 'fieldList'
        ) {
          // user pulled from field list into target
          // so need to add this to the label at the destination index
          let newLabel
          if (draggableId === 'separator') {
            newLabel = [
              ...state.label.slice(0, destination.index),
              {
                type: 'separator',
                value: '',
                id: uuidv7(),
              },
              ...state.label.slice(destination.index),
            ]
          } else {
            const fieldLabel = fieldLabels.find((el) => el.id === draggableId)
            newLabel = [
              ...state.label.slice(0, destination.index),
              // clone the label
              { ...fieldLabel },
              ...state.label.slice(destination.index),
            ]
          }
          return onChange(newLabel)
        }

        if (
          destination?.droppableId === 'target' &&
          source.droppableId === 'target' &&
          destination?.index !== source.index
        ) {
          // user moved inside target, to different index
          const newLabel = arrayMoveImmutable(
            state.label,
            source.index,
            destination.index,
          )
          return onChange(newLabel)
        }

        if (
          source.droppableId === 'target' &&
          (!destination || destination.droppableId !== 'target')
        ) {
          // user pulled from target anywhere outside
          // remove the label element at this index
          const clonedLabel = [...state.label]
          clonedLabel.splice(source.index, 1)
          const newLabel = clonedLabel.length ? clonedLabel : null
          return onChange(newLabel)
        }
      },
      [fieldLabels, onChange, state.label],
    )

    // TODO: hard to add field to second line if the line breaks?
    return (
      <div style={containerStyle} onBlur={onBlur}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={innerContainerStyle}>
            <Target label={state.label} onChange={onChange} />
            <FieldList fieldLabels={fieldLabels} />
          </div>
        </DragDropContext>
      </div>
    )
  },
)
