import {
  memo,
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import debounce from 'lodash/debounce'
import { useDebouncedCallback } from 'use-debounce'

import { Options } from './options.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'

export const ComboboxFilteringOptions = memo(
  forwardRef(({ autoFocus }, ref) => {
    const { db } = useElectric()!
    const { project_crs_id } = useParams()

    const [filter, setFilter] = useState('')
    const [crs, setCrs] = useState([])

    const where = useMemo(() => {
      if (!filter) return {}

      return {
        OR: [{ code: { contains: filter } }, { name: { contains: filter } }],
      }
    }, [filter])

    const fetchData = useCallback(async () => {
      const crs = await db.crs.findMany({ where })
      setCrs(crs)
    }, [db.crs, where])

    const fetchDataDebounced = useDebouncedCallback(fetchData, 500, {
      trailing: true,
    })

    useEffect(() => {
      if (!filter || filter.length < 2) return setCrs([])
      fetchDataDebounced()
    }, [fetchDataDebounced, filter])

    const onInput = useCallback((event) => setFilter(event.target.value), [])

    const onOptionSelect = useCallback(
      async (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        // find the option in the crsData
        const selectedOption = crs.find((o) => o.code === data.optionValue)
        db.project_crs.update({
          where: { project_crs_id },
          data: {
            code: selectedOption?.code ?? null,
            name: selectedOption?.name ?? null,
            proj4: selectedOption?.proj4 ?? null,
          },
        })
        setFilter('')
      },
      [crs, db.project_crs, project_crs_id],
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
          <Options filter={filter} optionsFiltered={crs} />
        </Combobox>
      </Field>
    )
  }),
)
