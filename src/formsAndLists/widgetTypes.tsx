import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createWidgetType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { widgetTypesFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

const from = '/data/_authLayout/widget-types'

export const WidgetTypes = memo(() => {
  const [filter] = useAtom(widgetTypesFilterAtom)

  const navigate = useNavigate({ from })
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT widget_type_id, label 
    FROM widget_types
    ${isFiltered ? ` WHERE ${filterString}` : ''}
    ORDER BY label`,
    undefined,
    'widget_type_id',
  )
  const isLoading = res === undefined
  const widgetTypes = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWidgetType({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.widget_type_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Widget Types"
        nameSingular="Widget Type"
        tableName="widget_types"
        isFiltered={isFiltered}
        countFiltered={widgetTypes.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {widgetTypes.map(({ widget_type_id, label }) => (
              <Row
                key={widget_type_id}
                label={label ?? widget_type_id}
                to={widget_type_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
