import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

export const DropdownField = memo(
  ({
    name,
    label,
    table,
    idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
    where = {},
    orderBy = { label: 'asc' },
    value,
    onChange,
    autoFocus,
    validationMessageIn,
    validationStateIn,
  }) => {
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

    const validationState = useMemo(
      () =>
        validationStateIn
          ? validationStateIn
          : !options?.length //&& !!value
          ? 'warning'
          : 'none',
      [options?.length, validationStateIn],
    )
    const validationMessage = useMemo(
      () =>
        validationMessageIn
          ? validationMessageIn
          : !options?.length //&& !!value
          ? `No ${table} found. Please add one first.`
          : undefined,
      [options?.length, table, validationMessageIn],
    )

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
    //   validationMessageIn,
    //   validationStateIn,
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
  },
)
