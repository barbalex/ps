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

export const SliderField = (props: InputProps) => {
  const {
    label,
    name,
    min,
    max,
    step,
    value,
    onChange,
    validationMessage,
    validationState = 'none',
  } = props

  // need to debounce changes when sliding or slider will not render correctly
  // do not use a small value or if slid slowly the user will loose the drag
  const onChangeSliderDebounced = useDebouncedCallback(onChange, 300)

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
          step={step ?? undefined}
          defaultValue={value}
          onChange={onChangeSliderDebounced}
          style={sliderStyle}
        />
        <Label aria-hidden>{max}</Label>
      </div>
    </Field>
  )
}
