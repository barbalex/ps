import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, RadioGroup, Radio } = fluentUiReactComponents

import { Loading } from './Loading.tsx'

type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name?: string
  label?: string
  list?: string[]
  isLoading?: boolean
  value?: string | null
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data?: any,
  ) => void
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  autoFocus?: boolean
  disabled?: boolean
  replaceUnderscoreInLabel?: boolean
  labelMap?: Record<string, string>
  layout?: 'vertical' | 'horizontal'
  ref?: React.Ref<HTMLInputElement>
}

export const RadioGroupField = (props: Props) => {
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

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const valueChoosen = (e.target as HTMLInputElement).value
    // if valueChoosen equals value, set value to null
    // else set value to valueChoosen
    onChangePassed(e as unknown as React.ChangeEvent<HTMLInputElement>, {
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
        value={value ?? undefined}
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
