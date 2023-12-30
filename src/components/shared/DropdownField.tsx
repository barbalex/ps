import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

export const DropdownField = memo((props: InputProps) => {
  const {
    name,
    label,
    table,
    idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
    where = {},
    orderBy = { label: 'asc' },
    value,
    onChange,
    autoFocus,
  } = props

  const { db } = useElectric()
  const { results = [] } = useLiveQuery(
    db[table]?.liveMany({
      where,
      orderBy,
    }),
  )
  const options = results.map((o) => ({
    text: o.label,
    value: o[idField ?? name],
  }))
  const selectedOptions = useMemo(
    () => options.filter(({ value: v }) => v === value),
    [options, value],
  )

  const validationState = !results?.length && !!value ? 'warning' : 'none'
  const validationMessage =
    !results?.length && !!value
      ? `No ${table} found. Please add one first.`
      : undefined

  // console.log('DropdownField', {
  //   name,
  //   label,
  //   table,
  //   value,
  //   options,
  //   selectedOptions,
  //   validationState,
  //   validationMessage,
  //   results,
  // })

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <Dropdown
        name={name}
        value={selectedOptions?.[0]?.text ?? ''}
        selectedOptions={selectedOptions}
        onOptionSelect={(e, data) =>
          onChange({ target: { name, value: data.optionValue } })
        }
        appearance="underline"
        autoFocus={autoFocus}
      >
        {options.map((params) => {
          const { text, value } = params

          return (
            <Option key={value} value={value}>
              {text}
            </Option>
          )
        })}
      </Dropdown>
    </Field>
  )
})
