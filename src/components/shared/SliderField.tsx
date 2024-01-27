import { memo, forwardRef, useState, useCallback } from 'react'
import { Field, Slider, Label, Input } from '@fluentui/react-components'
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

    const [sliderKey, setSliderKey] = useState(0)
    const [inputKey, setInputKey] = useState(0)
    const incrementSliderKey = useCallback(
      () => setSliderKey(sliderKey + 1),
      [sliderKey],
    )
    const incrementInputKey = useCallback(
      () => setInputKey(inputKey + 1),
      [inputKey],
    )
    const changeSlider = useCallback(
      (e, data) => {
        onChange(e, data)
        setTimeout(() => incrementInputKey())
      },
      [incrementInputKey, onChange],
    )
    const changeInput = useCallback(
      (e, data) => {
        onChange(e, data)
        setTimeout(() => incrementSliderKey())
      },
      [incrementSliderKey, onChange],
    )
    const onChangeSliderDebounced = useDebouncedCallback(changeSlider, 200)
    const onChangeInputDebounced = useDebouncedCallback(changeInput, 200)

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Label aria-hidden>{min}</Label>
            <Slider
              key={`${name}/${sliderKey}`}
              name={name}
              min={min}
              max={max}
              step={step}
              defaultValue={value}
              onChange={onChangeSliderDebounced}
            />
            <Label aria-hidden>{max}</Label>
          </div>
          {/* Input is not working due to the step? */}
          <Input
            key={`${name}/${inputKey}`}
            name={name}
            min={min}
            max={max}
            step={step}
            defaultValue={value}
            onChange={onChangeInputDebounced}
            type="number"
            appearance="outline"
            autoFocus={autoFocus}
            ref={ref}
          />
        </div>
      </Field>
    )
  }),
)
