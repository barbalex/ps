import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: '10px',
  userSelect: 'none',
}
const ddStyle = {
  flexGrow: 1,
}

interface Props {
  name: string
  label?: string
  list_id: string
  value: string
  onChange: () => void
  validationMessage?: string
  validationState?: string
  button?: React.ReactNode
}

export const DropdownFieldFromList = memo(
  ({
    name,
    label,
    list_id,
    value,
    onChange,
    validationMessage,
    validationState,
    button,
  }: Props) => {
    const res = useLiveQuery(`SELECT * FROM list_values WHERE list_id = $1`, [
      list_id,
    ])
    const options = useMemo(
      () => res.rows.map(({ value }) => value),
      [res.rows],
    )
    const selectedOptions = useMemo(
      () => options.filter((option) => option === value),
      [options, value],
    )

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <div style={rowStyle}>
          <Dropdown
            name={name}
            value={selectedOptions?.[0] ?? ''}
            selectedOptions={selectedOptions}
            onOptionSelect={(e, data) =>
              onChange({ target: { name, value: data.optionValue } })
            }
            appearance="underline"
            style={ddStyle}
            clearable
          >
            {options.map((option) => {
              return <Option key={option}>{option}</Option>
            })}
          </Dropdown>
          {!!button && button}
        </div>
      </Field>
    )
  },
)
