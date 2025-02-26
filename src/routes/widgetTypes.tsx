import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createWidgetType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { widgetTypesFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(widgetTypesFilterAtom)
  const isFiltered = !!filter

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM widget_types${
      isFiltered ? ` WHERE ${filter}` : ''
    } order by label asc`,
  )
  const widgetTypes = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWidgetType({ db })
    const data = res?.rows?.[0]
    navigate({ pathname: data.widget_type_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Widget Types"
        nameSingular="Widget Type"
        tableName="widget_types"
        isFiltered={isFiltered}
        countFiltered={widgetTypes.length}
        addRow={add}
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
