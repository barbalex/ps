import { useCallback } from 'react'
import { Input } from '@fluentui/react-components'

import { TargetElement } from './TargetElements'
import { LabelElement } from '..'

const containerStyle = {
  position: 'relative',
}
// const StyledTextField = styled(TextField)`
//   margin-right: 6px;
//   margin-bottom: 0;
//   width: 100px;
//   label {
//     font-size: small !important;
//     padding-left: 6px;
//   }
//   input {
//     font-size: small !important;
//   }
// `

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
      console.log(
        'occurrenceImport, Three, LabelCreator, Target, BetweenCharacters, onBlur',
        { event, value: event.target.value },
      )
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
        defaultValue={el.value ?? ''}
        appearance="outline"
        size="small"
        onBlur={onBlur}
      />
      {children}
    </div>
  )
}

export default BetweenCharacters
