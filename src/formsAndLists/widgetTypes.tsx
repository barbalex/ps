import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetType } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWidgetTypesNavData } from '../modules/useWidgetTypesNavData.ts'

import '../form.css'

const from = '/data/_authLayout/widget-types'

export const WidgetTypes = memo(() => {
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { navData, loading, isFiltered } = useWidgetTypesNavData()

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
        countFiltered={navData.length}
        isLoading={loading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navData.map(({ widget_type_id, label }) => (
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
