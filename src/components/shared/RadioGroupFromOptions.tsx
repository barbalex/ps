import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, RadioGroup, Radio } = fluentUiReactComponents
import { useResizeDetector } from 'react-resize-detector'

type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name?: string
  label?: string
  options?: { label?: string; value?: string }[]
  value?: string | null
  onChange: (ev: { target: { name?: string; value?: string | null } }) => void
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  autoFocus?: boolean
  disabled?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const RadioGroupFromOptions = (props: Props) => {
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
  const onChange = (_e: unknown, data: { value?: string | null }) => {
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
        value={value ?? undefined}
        onChange={onChange}
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
