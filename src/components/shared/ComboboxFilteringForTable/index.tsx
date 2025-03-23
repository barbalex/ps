import { memo, useState, useCallback, useEffect, useMemo } from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { FilteringComboboxOptions } from './options.tsx'

export const ComboboxFilteringForTable = memo(
  ({
    name,
    label,
    table,
    idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
    labelFromResult, // allows passing in special data. Not in use yet.
    value,
    onChange,
    autoFocus,
    ref,
  }) => {
    const [filter, setFilter] = useState('')

    const res = useLiveQuery(
      `
      SELECT * FROM ${table} 
      ${value ? `WHERE ${idField ?? name} = '${value}'` : ''}
      ORDER BY label`,
    )
    const results = useMemo(() => res?.rows ?? [], [res])
    const selectedOptions = useMemo(
      () =>
        results.map((o) => ({
          text: o.label,
          value: o[idField ?? name],
        })),
      [idField, name, results],
    )
    useEffect(() => {
      const filter = selectedOptions[0]?.text ?? ''
      setFilter(filter)
    }, [selectedOptions, value])

    const onInput = useCallback(
      (event) => {
        const filter = event.target.value
        setFilter(filter)
      },
      [setFilter],
    )
    const onOptionSelect = useCallback(
      (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        onChange({ target: { name, value: data.optionValue } })
      },
      [name, onChange],
    )

    // console.log('FilteringCombobox', {
    //   name,
    //   label,
    //   table,
    //   value,
    //   filter,
    //   selectedOptions,
    //   results,
    //   res,
    //   idField,
    // })

    return (
      <Field label={label ?? '(no label provided)'}>
        <Combobox
          name={name}
          value={filter}
          selectedOptions={selectedOptions}
          onOptionSelect={onOptionSelect}
          onInput={onInput}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          freeform
          clearable
        >
          <FilteringComboboxOptions
            name={name}
            table={table}
            idField={idField}
            labelFromResult={labelFromResult}
            filter={filter}
          />
        </Combobox>
      </Field>
    )
  },
)
