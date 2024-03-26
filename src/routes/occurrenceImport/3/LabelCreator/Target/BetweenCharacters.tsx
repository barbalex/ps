import { useCallback, memo } from 'react'
import { Input } from '@fluentui/react-components'

import { TargetElement } from './TargetElements'
import { LabelElement } from '..'

const containerStyle = {
  position: 'relative',
  top: 4,
}
const inputStyle = {
  marginRight: 6,
  width: 90,
  height: 35,
}

interface Props {
  el: TargetElement
  label: LabelElement[]
  name: string
  onChange: () => void
  index: number
  children: React.ReactNode
}

export const BetweenCharacters = memo(
  ({
    el,
    label,
    name,
    onChange,
    index,
    children,
    snapshot,
    provided,
  }: Props): PropsWithChildren => {
    const onBlur = useCallback(
      (event) => {
        console.log(
          'occurrenceImport, Three, LabelCreator, BetweenCharacters, onBlur',
          { el, label, index, event },
        )
        const newLabel = [...label]
        newLabel.forEach((labelElement, i) => {
          if (i === index) {
            labelElement.value = event.target.value
          }
        })
        // for (const labelElement of newLabel) {
        //   if (labelElement.type === 'separator') {
        //     labelElement.value = event.target.value
        //     break
        //   }
        // }
        // newLabel[index].value = event.target.value
        console.log(
          'occurrenceImport, Three, LabelCreator, BetweenCharacters, onBlur, newLabel:',
          newLabel,
        )
        onChange({ target: { value: newLabel, name } })
      },
      [el, index, label, name, onChange],
    )

    return (
      <div
        style={{
          ...(snapshot.isDragging ? {} : containerStyle),
          ...provided.draggableProps.style,
        }}
      >
        <Input
          label="Separator (any Text)"
          placeholder="Enter any text"
          defaultValue={el.value ?? ''}
          appearance="outline"
          size="small"
          onBlur={onBlur}
          style={inputStyle}
        />
        {children}
      </div>
    )
  },
)
