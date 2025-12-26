import { Field, Slider, Label } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

import styles from './SliderField.module.css'

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
      <div className={styles.container}>
        <Label aria-hidden>{min}</Label>
        <Slider
          key={value}
          name={name}
          min={min}
          max={max}
          step={step ?? undefined}
          defaultValue={value}
          onChange={onChangeSliderDebounced}
          className={styles.slider}
        />
        <Label aria-hidden>{max}</Label>
      </div>
    </Field>
  )
}
