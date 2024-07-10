import { memo, useMemo, forwardRef } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider.tsx'

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

export const DropdownField = memo(
  forwardRef(
    (
      {
        name,
        label,
        labelField = 'label',
        table,
        idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
        where = {},
        orderBy = { label: 'asc' },
        value,
        onChange,
        autoFocus,
        validationMessage: validationMessageIn,
        validationState: validationStateIn = 'none',
        button,
      },
      ref,
    ) => {
      const { db } = useElectric()!
      const { results = [] } = useLiveQuery(
        db[table]?.liveMany({
          where,
          orderBy,
        }),
      )
      const options = results.map((o) => ({
        text: o[labelField],
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

      return (
        <Field
          label={label ?? '(no label provided)'}
          validationMessage={validationMessage}
          validationState={validationState}
        >
          <div style={rowStyle}>
            <Dropdown
              name={name}
              value={selectedOptions?.[0]?.text ?? ''}
              selectedOptions={selectedOptions}
              onOptionSelect={(e, data) =>
                onChange({ target: { name, value: data.optionValue } })
              }
              appearance="underline"
              autoFocus={autoFocus}
              ref={ref}
              style={ddStyle}
              clearable
            >
              {options.length ? (
                options.map((params) => {
                  const { text, value } = params

                  return (
                    <Option key={value} value={value}>
                      {text}
                    </Option>
                  )
                })
              ) : (
                <Option value={''}>
                  No WMS Services found. You need to create one.
                </Option>
              )}
            </Dropdown>
            {!!button && button}
          </div>
        </Field>
      )
    },
  ),
)
