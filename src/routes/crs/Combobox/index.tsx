import {
  memo,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { Options } from './options.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import * as crsDataImport from './crs.json'

export const ComboboxFilteringOptions = memo(
  forwardRef(({ name, value, onChange, autoFocus }, ref) => {
    const { db } = useElectric()!
    const { crs_id } = useParams()

    const crsData = crsDataImport.default
    const options = useMemo(
      () =>
        crsData.map((d) => ({
          label: d.name,
          value: d.code,
        })),
      [crsData],
    )

    const [filter, setFilter] = useState('')

    const selectedOptions = useMemo(
      () => options.filter((o) => o.value === value),
      [options, value],
    )

    useEffect(() => {
      const filter = selectedOptions[0]?.value ?? ''
      setFilter(filter)
    }, [selectedOptions, value])

    const onInput = useCallback((event) => {
      const filter = event.target.value
      setFilter(filter)
    }, [])
    const onOptionSelect = useCallback(
      async (e, data) => {
        console.log('ComboboxFilteringOptions, onOptionSelect:', {
          e,
          data,
        })
        if (data.optionValue === 0) return setFilter('') // No options found
        // find the option in the crsData
        const selectedOption = crsData.find((o) => o.code === data.optionValue)
        console.log(
          'ComboboxFilteringOptions, onOptionSelect, selectedOption:',
          {
            selectedOption,
          },
        )
        db.crs.update({
          where: { crs_id },
          data: {
            code: selectedOption.code,
            name: selectedOption.name,
            proj4: selectedOption.proj4,
          },
        })
        setFilter('')
      },
      [crsData, crs_id, db.crs],
    )

    const filteredOptions = useMemo(
      () =>
        filter.length > 1
          ? crsData.filter(
              (o) =>
                o.code?.toLowerCase?.().includes(filter?.toLowerCase?.()) ||
                o.name?.toLowerCase?.().includes(filter?.toLowerCase?.()),
            )
          : [],
      [filter, crsData],
    )

    console.log('ComboboxFilteringOptions', {
      filteredOptions,
      options,
      filter,
      crsData,
      // selectedOptions,
    })

    return (
      <Field
        label="Choose a CRS"
        validationState="none"
        validationMessage="Type to filter from > 10'000 crs options"
      >
        <Combobox
          name={name}
          value={filter}
          // selectedOptions={selectedOptions}
          onOptionSelect={onOptionSelect}
          onInput={onInput}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          freeform
          clearable
        >
          <Options filter={filter} optionsFiltered={filteredOptions} />
        </Combobox>
      </Field>
    )
  }),
)
