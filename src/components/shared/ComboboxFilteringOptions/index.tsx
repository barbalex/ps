import {
  memo,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Combobox, Field } from '@fluentui/react-components'

import { Options } from './options.tsx'

export const ComboboxFilteringOptions = memo(
  forwardRef(({ name, label, options, value, onChange, autoFocus }, ref) => {
    const [filter, setFilter] = useState('')

    const selectedOptions = useMemo(
      () => options.filter((o) => o.value === value),
      [options, value],
    )
    console.log('ComboboxFilteringOptions, selectedOptions:', selectedOptions)

    useEffect(() => {
      const filter = selectedOptions[0]?.value ?? ''
      console.log(
        'ComboboxFilteringOptions, useEffect, setting filter to:',
        filter,
      )
      setFilter(filter)
    }, [selectedOptions, value])

    const onInput = useCallback((event) => {
      const filter = event.target.value
      console.log(
        'ComboboxFilteringOptions, onInput, setting filter to:',
        filter,
      )
      setFilter(filter)
    }, [])
    const onOptionSelect = useCallback(
      (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        console.log('ComboboxFilteringOptions, onOptionSelect:', {
          name,
          value: data.optionValue,
        })
        // onChange({ target: { name, value: data.optionValue } })
      },
      [name],
    )

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
          <Options
            filter={filter}
            optionsFiltered={options.filter(
              (o) =>
                !o.name?.toLowerCase?.().includes(filter?.toLowerCase?.()) &&
                !o.code?.toLowerCase?.().includes(filter?.toLowerCase?.()),
            )}
          />
        </Combobox>
      </Field>
    )
  }),
)
