import { memo, useState, useCallback } from 'react'
import { Field, Slider, Label } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
}
const sliderStyle = {
  flexGrow: 1,
}

export const SliderField = memo((props: InputProps) => {
  const {
    label,
    name,
    min,
    max,
    step = 1,
    value: valueIn,
    onChange: onChangeIn,
    validationMessage,
    validationState = 'none',
  } = props

  const [value, setValue] = useState(valueIn)

  // need to debounce changes when sliding or slider will not render correctly
  // do not use a small value or if slid slowly the user will loose the drag
  // const onChangeSliderDebounced = useDebouncedCallback(onChange, 300)
  const onChange = useCallback((_, data) => {
    setValue(data.value)
  }, [])

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div style={containerStyle}>
        <Label aria-hidden>{min}</Label>
        <Slider
          key={value}
          name={name}
          min={min}
          max={max}
          step={step}
          defaultValue={value}
          // onChange={onChangeSliderDebounced}
          onChange={onChange}
          style={sliderStyle}
        />
        <Label aria-hidden>{max}</Label>
      </div>
    </Field>
  )
})
