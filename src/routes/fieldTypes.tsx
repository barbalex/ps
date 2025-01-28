import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createFieldType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { fieldTypesFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(fieldTypesFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: fieldTypes = [] } = useLiveQuery(
    db.field_types.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )
  const { results: fieldTypesUnfiltered = [] } = useLiveQuery(
    db.field_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = fieldTypes.length !== fieldTypesUnfiltered.length

  const add = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate({ pathname: data.field_type_id, search: searchParams.toString() })
  }, [db.field_types, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Field Types (${
          isFiltered
            ? `${fieldTypes.length}/${fieldTypesUnfiltered.length}`
            : fieldTypes.length
        })`}
        addRow={add}
        tableName="field type"
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
