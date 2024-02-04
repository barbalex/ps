import { useState, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input, Field } from '@fluentui/react-components'

import { Label } from './Label'

const inputRowStyle = {
  display: 'flex',
}
const inputLabelStyle = {
  color: 'rgba(0, 0, 0, 0.8)',
  fontSize: '0.8rem',
  paddingRight: '8px',
  alignSelf: 'center',
}
// need to vertically align, see: https://github.com/microsoft/fluentui/issues/30470
const fieldStyle = { gridTemplateColumns: '80px 1fr', alignItems: 'center' }
const inputStyle = {
  width: 80,
}
const formControlStyle = {
  paddingBottom: '19px',
}

interface Props {
  color?: string
  onBlur: () => void
  label: string
  name: string
  disabled?: boolean
}

export const ColorPicker = ({
  color = '#ff0000',
  onChange,
  label,
  name,
  disabled,
}: Props) => {
  const [val, setVal] = useState<string>('')

  useEffect(() => {
    setVal(color ?? '')
  }, [color])

  const onBlurControl = useCallback(() => {
    const fakeEvent = {
      target: {
        name,
        value: val,
      },
    }
    onChange(fakeEvent)
  }, [name, onChange, val])

  const onBlurInput = useCallback(() => {
    setTimeout(() => onBlurControl)
  }, [onBlurControl])

  // weird placing without the div
  return (
    <div>
      <div style={formControlStyle} onBlur={onBlurControl}>
        <Label label={label} />
        <HexColorPicker color={val} onChange={setVal} />
        <Field label="Hex-Wert" orientation="horizontal" style={fieldStyle}>
          <Input
            name={name}
            value={val}
            type="text"
            onChange={(e) => setVal(e.target.value)}
            onBlur={onBlurInput}
            disabled={disabled}
            style={inputStyle}
            appearance="underline"
          />
        </Field>
      </div>
    </div>
  )
}
