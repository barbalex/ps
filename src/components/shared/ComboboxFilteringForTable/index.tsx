import { useState, useEffect, useMemo } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Combobox, Field } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

import { FilteringComboboxOptions } from './options.tsx'

type ComboboxProps = React.ComponentProps<typeof Combobox>
type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name: string
  label?: string
  table: string
  // defaults to name, used for cases where the id field is not the same as the name field (?)
  idField?: string
  value?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  ref?: ComboboxProps['ref']
  // accepted for consistency with other fields but not used
  include?: unknown
  validationMessage?: FieldProps['validationMessage']
  validationState?: FieldProps['validationState']
}

export const ComboboxFilteringForTable = ({
  name,
  label,
  table,
  idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
  value,
  onChange,
  autoFocus,
  ref,
}: Props) => {
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')

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
        text: o.label as string,
        value: o[idField ?? name] as string,
      })),
    [idField, name, results],
  )
  useEffect(() => {
    // Only set filter from selected options if there's an actual value
    // Otherwise, if value is empty, all options are loaded and we'd show the first one incorrectly
    const filter = value ? (selectedOptions[0]?.text ?? '') : ''
    setFilter(filter)
  }, [selectedOptions, value])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter)
    }, 100)

    return () => clearTimeout(timer)
  }, [filter])

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = (event.target as HTMLInputElement).value
    setFilter(filter)
  }

  const onOptionSelect: NonNullable<ComboboxProps['onOptionSelect']> = (
    _e,
    data,
  ) => {
    if ((data.optionValue as string | number) === 0) return setFilter('') // No options found
    onChange({
      target: { name, value: data.optionValue },
    } as unknown as React.ChangeEvent<HTMLInputElement>)
  }

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
        selectedOptions={selectedOptions as unknown as string[]}
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
          filter={debouncedFilter}
        />
      </Combobox>
    </Field>
  )
}
