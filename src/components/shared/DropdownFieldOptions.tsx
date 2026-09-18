import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents

type InputProps = React.ComponentProps<typeof fluentUiReactComponents.Input>
type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]
type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name: string
  label?: string
  options: { label?: React.ReactNode; value?: string | null }[]
  value?: unknown
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => void
  autoFocus?: boolean
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  ref?: React.Ref<HTMLInputElement>
}

export const DropdownFieldOptions = ({
  name,
  label,
  options,
  value,
  onChange,
  autoFocus,
  validationMessage,
  validationState = 'none',
  ref,
}: Props) => {
  // consumers pass Fluent's (ev, data) change handlers; called here with fake events
  const onChangeFake = onChange as unknown as (e: {
    target: { name?: string; value?: string | null }
  }) => void

  const onChangeOption = (_e: unknown, data: { optionValue?: string }) =>
    onChangeFake({ target: { name, value: data.optionValue } })

  const selectedOptions = options.filter(({ value: v }) => v === value)

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <Dropdown
        name={name}
        value={selectedOptions?.[0]?.value ?? ''}
        selectedOptions={selectedOptions as unknown as string[]}
        onOptionSelect={onChangeOption}
        appearance="underline"
        autoFocus={autoFocus}
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        clearable
      >
        {options.map(({ label, value }) => (
          <Option
            key={value}
            value={value as string}
          >
            {label as string}
          </Option>
        ))}
      </Dropdown>
    </Field>
  )
}
