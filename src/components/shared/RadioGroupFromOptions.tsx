import { memo, forwardRef, useCallback } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

export const RadioGroupFromOptions = memo(
  forwardRef((props, ref) => {
    const {
      name,
      label,
      options = [],
      value,
      onChange: onChangePassed,
      validationMessage,
      validationState = 'none',
      autoFocus,
      disabled = false,
      // replaceUnderscoreInLabel = false,
    } = props

    const { width, ref: widthRef } = useResizeDetector({
      handleHeight: false,
      refreshMode: 'debounce',
      refreshRate: 100,
      refreshOptions: { leading: false, trailing: true },
    })

    const verticalLayout = !!width && width < 500

    const onChange = useCallback(
      (e, data) => {
        const fakeEvent = {
          target: { name, value: data.value },
        }
        onChangePassed(fakeEvent)
      },
      [name, onChangePassed],
    )

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
        ref={widthRef}
      >
        <RadioGroup
          layout={verticalLayout ? 'vertical' : 'horizontal'}
          name={name}
          value={value}
          onChange={onChange}
          appearance="underline"
          disabled={disabled}
        >
          {options.map((val, index) => (
            <Radio
              key={val.value}
              label={val.label}
              value={val.value}
              autoFocus={index === 0 && autoFocus}
              ref={index === 0 ? ref : undefined}
            />
          ))}
        </RadioGroup>
      </Field>
    )
  }),
)
