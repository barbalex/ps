import { useState, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input, Field } from '@fluentui/react-components'

const outerFieldStyle = {
  paddingBottom: 19,
  paddingTop: 19,
}
// need to vertically align, see: https://github.com/microsoft/fluentui/issues/30470
const horizontalFieldStyle = {
  gridTemplateColumns: '80px 1fr',
  alignItems: 'center',
}
const inputStyle = {
  width: 80,
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
    <Field label={label} style={outerFieldStyle}>
      <HexColorPicker color={val} onChange={setVal} />
      <Field
        label="Hex-Wert"
        orientation="horizontal"
        style={horizontalFieldStyle}
      >
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
    </Field>
  )
}
