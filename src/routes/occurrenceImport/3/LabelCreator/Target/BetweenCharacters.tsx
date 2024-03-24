import { useCallback } from 'react'
import TextField from '@mui/material/TextField'
import { Input } from '@fluentui/react-components'
import styled from '@emotion/styled'

import { TargetElement } from './TargetElements'
import { LabelElement } from '..'

const containerStyle = {
  position: 'relative',
}
const StyledTextField = styled(TextField)`
  margin-right: 6px;
  margin-bottom: 0;
  width: 100px;
  label {
    font-size: small !important;
    padding-left: 6px;
  }
  input {
    font-size: small !important;
  }
`

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
      onChange({ target: { [name]: newRowLabel } })
    },
    [index, label, onChange],
  )
  return (
    <div style={containerStyle}>
      <Input
        label="Zeichen"
        defaultValue={el.text ?? ''}
        appearance="outline"
        size="small"
        onBlur={onBlur}
      />
      {children}
    </div>
  )
}

export default BetweenCharacters
