import { memo, forwardRef, useState, useCallback } from 'react'
import { Field, Slider, Label, Input } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

const MyInput = forwardRef((props: InputProps, ref) => {
  const { name, min, max, step, value, onChange, autoFocus } = props
  console.log('hello MyInput', { name, value })
  const onChangeInputDebounced = useDebouncedCallback(onChange, 200)
  return (
    <Input
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      type="number"
      appearance="outline"
      autoFocus={autoFocus}
      ref={ref}
    />
  )
})

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
    const onChangeSlider = useCallback(
      (e, data) => {
        onChange(e, data)
        setTimeout(incrementInputKey)
      },
      [incrementInputKey, onChange],
    )
    const onChangeInput = useCallback(
      async (e, data) => {
        await onChange(e, data)
        incrementSliderKey()
      },
      [incrementSliderKey, onChange],
    )
    const onChangeSliderDebounced = useDebouncedCallback(onChangeSlider, 200)

    console.log('hello SliderField', { name, value, sliderKey, inputKey })

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingRight: 10,
              flexGrow: 1,
            }}
          >
            <Label aria-hidden>{min}</Label>
            <Slider
              key={`${name}/${sliderKey}/${value}`}
              name={name}
              min={min}
              max={max}
              step={step}
              defaultValue={value}
              onChange={onChangeSliderDebounced}
              style={{ flexGrow: 1 }}
            />
            <Label aria-hidden>{max}</Label>
          </div>
          <Input
            name={name}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChangeInput}
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
