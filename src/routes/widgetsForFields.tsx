import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createWidgetForField } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_widgets_for_fields?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_widgets_for_fields],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: widgetsForFields = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
      where,
    }),
  )
  const { results: widgetsForFieldsUnfiltered = [] } = useLiveQuery(
    db.widgets_for_fields.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered =
    widgetsForFields.length !== widgetsForFieldsUnfiltered.length

  const add = useCallback(async () => {
    const data = createWidgetForField()
    await db.widgets_for_fields.create({ data })
    navigate({
      pathname: data.widget_for_field_id,
      search: searchParams.toString(),
    })
  }, [db.widgets_for_fields, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Widgets For Fields (${
          isFiltered
            ? `${widgetsForFields.length}/${widgetsForFieldsUnfiltered.length}`
            : widgetsForFields.length
        })`}
        addRow={add}
        tableName="widget for field"
        menus={
          <FilterButton
            table="widgets_for_fields"
            filterField="filter_widgets_for_fields"
          />
        }
      />
      <div className="list-container">
        {widgetsForFields.map(({ widget_for_field_id, label }) => (
          <Row
            key={widget_for_field_id}
            label={label ?? widget_for_field_id}
            to={widget_for_field_id}
          />
        ))}
      </div>
    </div>
  )
}
