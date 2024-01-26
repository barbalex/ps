import { memo, forwardRef } from 'react'
import { Field, Slider } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

export const SliderField = memo(
  forwardRef((props: InputProps, ref) => {
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
      autoFocus,
    } = props

    const onChangeDebounced = useDebouncedCallback(onChange, 200)

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <Slider
          name={name}
          min={min}
          max={max}
          step={step}
          defaultValue={value}
          onChange={onChangeDebounced}
          autoFocus={autoFocus}
          ref={ref}
        />
      </Field>
    )
  }),
)
