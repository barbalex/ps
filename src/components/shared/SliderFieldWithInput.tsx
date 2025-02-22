import { memo } from 'react'
import { Field, Slider, Label, Input } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useDebouncedCallback } from 'use-debounce'

export const SliderFieldWithInput = memo((props: InputProps) => {
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
    ref,
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
            key={value}
            name={name}
            min={min}
            max={max}
            step={step ?? undefined}
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
          onChange={onChangeSliderDebounced}
          type="number"
          appearance="outline"
          autoFocus={autoFocus}
          ref={ref}
          style={{
            width:
              max > 10000000
                ? '9em'
                : max > 100000
                ? '8em'
                : max > 10000
                ? '7em'
                : max > 1000
                ? '6em'
                : max > 100
                ? '6em'
                : '5em',
          }}
        />
      </div>
    </Field>
  )
})
