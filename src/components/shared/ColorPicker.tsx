import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input, Field } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

import styles from './ColorPicker.module.css'

interface Props {
  color?: string
  onBlur: () => void
  label: string
  name: string
  disabled?: boolean
}

export const ColorPicker = ({
  color: colorIn,
  onChange,
  label,
  name,
  disabled = false,
}: Props) => {
  const color = colorIn ?? '#ff0000'

  const [val, setVal] = useState<string>(color)

  // need to debounce changes when choosing
  const onChangeDebounced = useDebouncedCallback(onChange, 300)

  const onChangeColorPicker = (color: string) => {
    setVal(color)
    const fakeEvent = {
      target: {
        name,
        value: val,
      },
    }
    onChangeDebounced(fakeEvent)
  }

  const onChangeInput = (e) => setVal(e.target.value)

  const onBlurControl = () => {
    const fakeEvent = {
      target: {
        name,
        value: val,
      },
    }
    onChange(fakeEvent)
  }

  return (
    <Field label={label}>
      <HexColorPicker color={val} onChange={onChangeColorPicker} />
      <Field
        label="Hex-Wert"
        orientation="horizontal"
        className={styles.horizontalField}
      >
        <Input
          name={name}
          value={val}
          onChange={onChangeInput}
          onBlur={onBlurControl}
          disabled={disabled}
          className={styles.input}
          appearance="underline"
        />
      </Field>
    </Field>
  )
}
