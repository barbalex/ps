import { useState, useCallback, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Combobox, Field } = fluentUiReactComponents
import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { useDebouncedCallback } from 'use-debounce'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { Options } from './options.tsx'
import { addOperationAtom } from '../../../store.ts'
import type Crs from '../../../models/public/Crs.ts'

const from = '/data/projects/$projectId_/crs/$projectCrsId/'

export const ComboboxFilteringOptions = ({ autoFocus, ref }) => {
  const db = usePGlite()
  const { projectCrsId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [filter, setFilter] = useState('')
  const [crs, setCrs] = useState([])

  const fetchData = useCallback(async () => {
    const sql = filter
      ? 'SELECT * FROM crs WHERE code ILIKE $1 OR name ILIKE $1'
      : 'SELECT * FROM crs'
    const vals = filter ? [`%${filter}%`] : []
    const res = await db.query(sql, vals)
    const crs: Crs[] = res?.rows
    setCrs(crs)
  }, [db, filter])

  const fetchDataDebounced = useDebouncedCallback(fetchData, 500, {
    trailing: true,
  })

  useEffect(() => {
    if (!filter || filter.length < 2) return setCrs([])
    fetchDataDebounced()
  }, [fetchDataDebounced, filter])

  const onInput = (event) => setFilter(event.target.value)

  const onOptionSelect = async (e, data) => {
    if (data.optionValue === 0) return setFilter('') // No options found
    // find the option in the crsData
    const selectedOption = crs.find((o) => o.code === data.optionValue)
    await db.query(
      `UPDATE project_crs SET code = $1, name = $2, proj4 = $3 WHERE project_crs_id = $4`,
      [
        selectedOption?.code ?? null,
        selectedOption?.name ?? null,
        selectedOption?.proj4 ?? null,
        projectCrsId,
      ],
    )
    setFilter('')
    addOperation({
      table: 'project_crs',
      rowIdName: 'project_crs_id',
      rowId: projectCrsId,
      operation: 'update',
      draft: {
        code: selectedOption?.code ?? null,
        name: selectedOption?.name ?? null,
        proj4: selectedOption?.proj4 ?? null,
      },
      prev: { ...selectedOption },
    })
  }

  return (
    <Field
      label={formatMessage({ id: 'Zy6AbC', defaultMessage: 'CRS auswählen' })}
      validationState="none"
      validationMessage={formatMessage({ id: 'Bd7CeD', defaultMessage: "Tippen um aus > 10'000 CRS-Optionen zu filtern" })}
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
}
