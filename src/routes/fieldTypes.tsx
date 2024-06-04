import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createFieldType } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_field_types?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_field_types],
  )
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
        menus={[
          <FilterButton
            key="filter_field_types"
            table="field_types"
            filterField="filter_field_types"
          />,
        ]}
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
