import { useCallback } from 'react'
import { Input } from '@fluentui/react-components'

import { TargetElement } from './TargetElements'
import { LabelElement } from '..'

const containerStyle = {
  position: 'relative',
  top: 4,
}
const inputStyle = {
  marginRight: 6,
  width: 100,
  height: 35,
}

interface Props {
  el: TargetElement
  label: LabelElement[]
  onChange: () => void
  index: number
  children: React.ReactNode
}

const BetweenCharacters = ({
  el,
  label,
  onChange,
  index,
  children,
}: Props): PropsWithChildren => {
  const onBlur = useCallback(
    (event) => {
      const newRowLabel = [
        ...label.slice(0, index),
        {
          type: 'separator',
          value: event.target.value,
        },
        ...label.slice(index),
      ]
      onChange({ target: { value: newRowLabel, name } })
    },
    [index, label, onChange],
  )

  return (
    <div style={containerStyle}>
      <Input
        label="Separator (any Text)"
        placeholder="Enter any text"
        defaultValue={el.value ?? ''}
        appearance="outline"
        size="medium"
        onBlur={onBlur}
        style={inputStyle}
      />
      {children}
    </div>
  )
}

export default BetweenCharacters
