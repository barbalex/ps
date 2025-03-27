import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createFieldType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { fieldTypesFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

const from = '/data/_authLayout/field-types'

export const FieldTypes = memo(() => {
  const [filter] = useAtom(fieldTypesFilterAtom)
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT field_type_id, label 
    FROM field_types 
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`,
    undefined,
    'field_type_id',
  )
  const isLoading = res === undefined
  const fieldTypes = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createFieldType({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.field_type_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Field Types"
        nameSingular="Field Type"
        tablename="field_types"
        isFiltered={isFiltered}
        countFiltered={fieldTypes.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {fieldTypes.map(({ field_type_id, label }) => (
              <Row
                key={field_type_id}
                label={label ?? field_type_id}
                to={field_type_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
