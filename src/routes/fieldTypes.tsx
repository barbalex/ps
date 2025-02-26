import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createFieldType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { fieldTypesFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(fieldTypesFilterAtom)
  const isFiltered = !!filter

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const resultFiltered = useLiveQuery(
    `SELECT * FROM field_types${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
  )
  const fieldTypes = resultFiltered?.rows ?? []

  const add = useCallback(async () => {
    const res = await createFieldType({ db })
    const fieldType = res?.rows?.[0]
    navigate({
      pathname: fieldType.field_type_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Field Types"
        nameSingular="Field Type"
        tablename="field_types"
        isFiltered={isFiltered}
        countFiltered={fieldTypes.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {fieldTypes.map(({ field_type_id, label }) => (
          <Row
            key={field_type_id}
            label={label ?? field_type_id}
            to={field_type_id}
          />
        ))}
      </div>
    </div>
  )
})
