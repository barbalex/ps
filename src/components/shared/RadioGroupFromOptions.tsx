import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

export const RadioGroupFromOptions = (props) => {
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
    ref,
  } = props

  const { width, ref: widthRef } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  const verticalLayout = !!width && width < 500

  // TODO: enable nulling when clicking on the selected radio
  // as in other RadioGroup components
  // do this when this component is actually used (not used now)
  const onChange = (e, data) => {
    const fakeEvent = {
      target: { name, value: data.value },
    }
    onChangePassed(fakeEvent)
  }

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
}
