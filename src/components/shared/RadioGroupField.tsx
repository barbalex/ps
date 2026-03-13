import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, RadioGroup, Radio } = fluentUiReactComponents

import { Loading } from './Loading.tsx'

export const RadioGroupField = (props) => {
  const {
    name,
    label,
    list = [],
    isLoading = false,
    value,
    onChange: onChangePassed,
    validationMessage,
    validationState = 'none',
    autoFocus,
    disabled = false,
    replaceUnderscoreInLabel = false,
    labelMap = {},
    layout = 'vertical',
    ref,
  } = props

  const onClick = (e) => {
    const valueChoosen = e.target.value
    // if valueChoosen equals value, set value to null
    // else set value to valueChoosen
    onChangePassed(e, {
      value: valueChoosen === value ? null : valueChoosen,
    })
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <RadioGroup
        layout={layout}
        name={name}
        value={value}
        appearance="underline"
        disabled={disabled}
      >
        {isLoading ? (
          <Loading alignLeft={true} />
        ) : (
          <>
            {list.map((val, index) => (
              <Radio
                key={val}
                label={
                  labelMap[val] ??
                  (replaceUnderscoreInLabel ? val.replaceAll('_', ' ') : val)
                }
                value={val}
                onClick={onClick}
                autoFocus={index === 0 && autoFocus}
                ref={index === 0 ? ref : undefined}
              />
            ))}
          </>
        )}
      </RadioGroup>
    </Field>
  )
}
