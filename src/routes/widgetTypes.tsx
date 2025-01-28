import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { widgetTypesFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(widgetTypesFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

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
        menus={<FilterButton isFiltered={isFiltered} />}
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
})
