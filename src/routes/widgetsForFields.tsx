import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { widgetsForFieldsFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const isFiltered = !!filter

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveIncrementalQuery(
    `SELECT widget_for_field_id, label FROM widgets_for_fields${
      isFiltered ? ` WHERE ${filter}` : ''
    } order by label asc`,
    undefined,
    'widget_for_field_id',
  )
  const widgetsForFields = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWidgetForField({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.widget_for_field_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Widgets For Fields"
        nameSingular="Widget For Field"
        tableName="widgets_for_fields"
        isFiltered={isFiltered}
        countFiltered={widgetsForFields.length}
        addRow={add}
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
