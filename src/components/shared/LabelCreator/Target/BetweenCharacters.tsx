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

export const BetweenCharacters = ({
  el,
  label,
  onChange,
  index,
  children,
  snapshot,
  provided,
}: Props) => {
  const onBlur = (event) => {
    const newLabel = [...label]
    newLabel.forEach((labelElement, i) => {
      if (i === index) {
        labelElement.value = event.target.value
      }
    })
    onChange(newLabel)
  }

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
}
