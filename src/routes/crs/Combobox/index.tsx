import { memo, forwardRef, useState, useCallback, useMemo } from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { Options } from './options.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import * as crsDataImport from './crs.json'

export const ComboboxFilteringOptions = memo(
  forwardRef(({ autoFocus }, ref) => {
    const { db } = useElectric()!
    const { crs_id } = useParams()

    const crsData = crsDataImport.default

    const [filter, setFilter] = useState('')

    const onInput = useCallback((event) => {
      const filter = event.target.value
      setFilter(filter)
    }, [])

    const onOptionSelect = useCallback(
      async (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        // find the option in the crsData
        const selectedOption = crsData.find((o) => o.code === data.optionValue)
        db.crs.update({
          where: { crs_id },
          data: {
            code: selectedOption?.code ?? null,
            name: selectedOption?.name ?? null,
            proj4: selectedOption?.proj4 ?? null,
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

    return (
      <Field
        label="Choose a CRS"
        validationState="none"
        validationMessage="Type to filter from > 10'000 crs options"
      >
        <Combobox
          value={filter}
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
