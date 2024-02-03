import { useState, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input } from '@fluentui/react-components'

import { Label } from './Label'
import { css } from '../../css'

const inputRowStyle = {
  display: 'flex',
}
const inputLabelStyle = {
  color: 'rgba(0, 0, 0, 0.8)',
  fontSize: '0.8rem',
  paddingRight: '8px',
  alignSelf: 'center',
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
  onBlur,
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
    onBlur(fakeEvent)
  }, [name, onBlur, val])
  const onBlurInput = useCallback(() => {
    setTimeout(() => onBlurControl)
  }, [onBlurControl])

  // weird placing without the div
  // TODO: use fluent ui Field
  return (
    <div>
      <div style={formControlStyle} onBlur={onBlurControl}>
        <Label label={label} />
        <HexColorPicker color={val} onChange={setVal} />
        <div style={inputRowStyle}>
          <div style={inputLabelStyle}>Hex-Wert:</div>
          <Input
            name={name}
            value={val}
            type="text"
            onChange={(e) => setVal(e.target.value)}
            onBlur={onBlurInput}
            disabled={disabled}
            style={css({
              '&:before': {
                borderBottomColor: 'rgba(0, 0, 0, 0.1)',
              },
              width: 70,
            })}
          />
        </div>
      </div>
    </div>
  )
}
