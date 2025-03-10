import { memo, useCallback } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

import { Loading } from './Loading.tsx'

export const RadioGroupField = memo((props) => {
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
    ref,
  } = props

  const { width, ref: widthRef } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  const verticalLayout = !!width && width < 500

  const onClick = useCallback(
    (e) => {
      const valueChoosen = e.target.value
      // if valueChoosen equals value, set value to null
      // else set value to valueChoosen
      onChangePassed(e, {
        value: valueChoosen === value ? null : valueChoosen,
      })
    },
    [onChangePassed, value],
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
                  replaceUnderscoreInLabel ? val.replaceAll('_', ' ') : val
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
})
