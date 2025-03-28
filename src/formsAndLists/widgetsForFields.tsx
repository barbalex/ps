import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createWidgetForField } from '../modules/createRows.ts'
import { useWidgetsForFieldsNavData } from '../modules/useWidgetsForFieldsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from = '/data/_authLayout/widgets-for-fields'

export const WidgetsForFields = memo(() => {
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { loading, navData, isFiltered } = useWidgetsForFieldsNavData()
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createWidgetForField({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.widget_for_field_id })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ widget_for_field_id, label }) => (
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
