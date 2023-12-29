import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

export const DropdownFieldFromList = memo(
  ({
    name,
    label,
    list_id,
    value,
    onChange,
    validationMessage,
    validationState,
  }) => {
    const { db } = useElectric()
    const { results: listItems = [] } = useLiveQuery(
      () => db.list_values.liveMany({ where: { list_id, deleted: false } }),
      [list_id],
    )
    const options = useMemo(
      () => listItems.map(({ value }) => value),
      [listItems],
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
        <Dropdown
          name={name}
          value={selectedOptions?.[0] ?? ''}
          selectedOptions={selectedOptions}
          onOptionSelect={(e, data) =>
            onChange({ target: { name, value: data.optionValue } })
          }
          appearance="underline"
        >
          {options.map((option) => {
            return <Option key={option}>{option}</Option>
          })}
        </Dropdown>
      </Field>
    )
  },
)
