import { useCallback, memo } from 'react'
import { Input } from '@fluentui/react-components'

import { TargetElement } from './TargetElements.tsx'
import { LabelElement } from '../index.tsx'

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
  ({ el, label, onChange, index, children, snapshot, provided }) => {
    const onBlur = useCallback(
      (event) => {
        const newLabel = [...label]
        newLabel.forEach((labelElement, i) => {
          if (i === index) {
            labelElement.value = event.target.value
          }
        })
        onChange(newLabel)
      },
      [index, label, onChange],
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
          onChange={onBlur}
          style={inputStyle}
          autoFocus
        />
        {children}
      </div>
    )
  },
)
