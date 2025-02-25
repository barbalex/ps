import { useState, useCallback, memo } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input, Field } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

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

export const ColorPicker = memo(
  ({ color: colorIn, onChange, label, name, disabled = false }: Props) => {
    const color = colorIn ?? '#ff0000'

    const [val, setVal] = useState<string>(color)

    // need to debounce changes when choosing
    const onChangeDebounced = useDebouncedCallback(onChange, 300)

    const onChangeColorPicker = useCallback(
      (color: string) => {
        setVal(color)
        const fakeEvent = {
          target: {
            name,
            value: val,
          },
        }
        onChangeDebounced(fakeEvent)
      },
      [name, onChangeDebounced, val],
    )

    const onChangeInput = useCallback((e) => setVal(e.target.value), [])

    const onBlurControl = useCallback(() => {
      const fakeEvent = {
        target: {
          name,
          value: val,
        },
      }
      onChange(fakeEvent)
    }, [name, onChange, val])

    return (
      <Field label={label}>
        <HexColorPicker
          color={val}
          onChange={onChangeColorPicker}
        />
        <Field
          label="Hex-Wert"
          orientation="horizontal"
          style={horizontalFieldStyle}
        >
          <Input
            name={name}
            value={val}
            onChange={onChangeInput}
            onBlur={onBlurControl}
            disabled={disabled}
            style={inputStyle}
            appearance="underline"
          />
        </Field>
      </Field>
    )
  },
)
