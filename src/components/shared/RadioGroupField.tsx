import { memo, forwardRef } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

export const RadioGroupField = memo(
  forwardRef((props, ref) => {
    const {
      name,
      label,
      list = [],
      value,
      onChange,
      validationMessage,
      validationState = 'none',
      autoFocus,
      disabled = false,
      replaceUnderscoreInLabel = false,
    } = props

    const { width, ref: widthRef } = useResizeDetector({
      handleHeight: false,
      refreshMode: 'debounce',
      refreshRate: 100,
      refreshOptions: { leading: false, trailing: true },
    })

    const verticalLayout = !!width && width < 500

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
          {list.map((val, index) => (
            <Radio
              key={val}
              label={replaceUnderscoreInLabel ? val.replaceAll('_', ' ') : val}
              value={val}
              autoFocus={index === 0 && autoFocus}
              ref={index === 0 ? ref : undefined}
            />
          ))}
        </RadioGroup>
      </Field>
    )
  }),
)
