import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { widgetsForFieldsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

const from = '/data/_authLayout/widgets-for-fields'

export const WidgetsForFields = memo(() => {
  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      widget_for_field_id, 
      label 
    FROM widgets_for_fields
    ${isFiltered ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`,
    undefined,
    'widget_for_field_id',
  )
  const isLoading = res === undefined
  const widgetsForFields = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWidgetForField({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.widget_for_field_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Widgets For Fields"
        nameSingular="Widget For Field"
        tableName="widgets_for_fields"
        isFiltered={isFiltered}
        countFiltered={widgetsForFields.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {widgetsForFields.map(({ widget_for_field_id, label }) => (
              <Row
                key={widget_for_field_id}
                label={label ?? widget_for_field_id}
                to={widget_for_field_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
