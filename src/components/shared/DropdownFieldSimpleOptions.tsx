import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents

type InputProps = React.ComponentProps<typeof fluentUiReactComponents.Input>
type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]
type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name: string
  label?: string
  options?: string[]
  value?: unknown
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => void
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  ref?: React.Ref<HTMLInputElement>
}

export const DropdownFieldSimpleOptions = ({
  name,
  label,
  options = [],
  value,
  onChange,
  validationMessage,
  validationState = 'none',
  ref,
}: Props) => {
  // consumers pass Fluent's (ev, data) change handlers; called here with fake events
  const onChangeFake = onChange as unknown as (e: {
    target: { name?: string; value?: string }
  }) => void

  const selectedOptions = options.filter((option) => option === value)

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <Dropdown
        name={name}
        value={selectedOptions?.[0] ?? ''}
        selectedOptions={selectedOptions}
        onOptionSelect={(_e: unknown, data: { optionValue?: string }) =>
          onChangeFake({ target: { name, value: data.optionValue } })
        }
        appearance="underline"
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        clearable
      >
        {options.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Dropdown>
    </Field>
  )
}
