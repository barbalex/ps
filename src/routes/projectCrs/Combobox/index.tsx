import { memo, useState, useCallback, useEffect } from 'react'
import { Combobox, Field } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { usePGlite } from '@electric-sql/pglite-react'

import { Options } from './options.tsx'

export const ComboboxFilteringOptions = memo(({ autoFocus, ref }) => {
  const db = usePGlite()
  const { project_crs_id } = useParams()

  const [filter, setFilter] = useState('')
  const [crs, setCrs] = useState([])

  const fetchData = useCallback(async () => {
    const sql = filter
      ? 'SELECT * FROM crs WHERE code ILIKE $1 OR name ILIKE $1'
      : 'SELECT * FROM crs'
    const vals = filter ? [`%${filter}%`] : []
    const res = await db.query(sql, vals)
    const crs = res.rows
    setCrs(crs)
  }, [db, filter])

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
      db.query(
        `UPDATE project_crs SET code = $1, name = $2, proj4 = $3 WHERE project_crs_id = $4`,
        [
          selectedOption?.code ?? null,
          selectedOption?.name ?? null,
          selectedOption?.proj4 ?? null,
          project_crs_id,
        ],
      )
      setFilter('')
    },
    [crs, db, project_crs_id],
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
})
