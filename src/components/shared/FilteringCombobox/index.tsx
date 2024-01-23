import {
  memo,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { FilteringComboboxOptions } from './options'

export const FilteringCombobox = memo(
  forwardRef(
    (
      {
        name,
        label,
        table,
        idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
        where: whereForOptions = {},
        orderBy = { label: 'asc' },
        include = {},
        labelFromResult, // allows passing in special data. Not in use yet.
        value,
        onChange,
        autoFocus,
      },
      ref,
    ) => {
      const [filter, setFilter] = useState('')

      const { db } = useElectric()
      const whereForSelectedOption = useMemo(
        () => ({
          [idField ?? name]:
            value === '' ? '99999999-9999-9999-9999-999999999999' : value,
        }),
        [idField, name, value],
      )
      const { results = [] } = useLiveQuery(
        () =>
          db[table]?.liveMany({
            where: whereForSelectedOption,
          }),
        [table, name, value, idField],
      )
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
      //   idField,
      //   whereForSelectedOption,
      //   whereForOptions,
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
          >
            <FilteringComboboxOptions
              name={name}
              table={table}
              idField={idField}
              where={whereForOptions}
              orderBy={orderBy}
              include={include}
              labelFromResult={labelFromResult}
              filter={filter}
            />
          </Combobox>
        </Field>
      )
    },
  ),
)
