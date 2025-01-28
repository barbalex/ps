import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { widgetsForFieldsFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

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
        menus={<FilterButton isFiltered={isFiltered} />}
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
})
