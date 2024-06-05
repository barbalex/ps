import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createWidgetType } from '../modules/createRows.ts'
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
      appState?.filter_widget_types?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_widget_types],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: widgetTypes = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
      where,
    }),
  )
  const { results: widgetTypesUnfiltered = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = widgetTypes.length !== widgetTypesUnfiltered.length

  const add = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate({ pathname: data.widget_type_id, search: searchParams.toString() })
  }, [db.widget_types, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Widget Types (${
          isFiltered
            ? `${widgetTypes.length}/${widgetTypesUnfiltered.length}`
            : widgetTypes.length
        })`}
        addRow={add}
        tableName="widget type"
        menus={[
          <FilterButton
            key="filter_widget_types"
            table="widget_types"
            filterField="filter_widget_types"
          />,
        ]}
      />
      <div className="list-container">
        {widgetTypes.map(({ widget_type_id, label }) => (
          <Row
            key={widget_type_id}
            label={label ?? widget_type_id}
            to={widget_type_id}
          />
        ))}
      </div>
    </div>
  )
}
)