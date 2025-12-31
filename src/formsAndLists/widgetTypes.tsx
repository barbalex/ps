import { useNavigate } from '@tanstack/react-router'

import { createWidgetType } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWidgetTypesNavData } from '../modules/useWidgetTypesNavData.ts'

import '../form.css'

const from = '/data/widget-types'

export const WidgetTypes = () => {
  const navigate = useNavigate({ from })

  const { navData, loading, isFiltered } = useWidgetTypesNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const widgetTypeId = await createWidgetType()
    if (!widgetTypeId) return
    navigate({ to: widgetTypeId })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ id, label }) => (
              <Row key={id} label={label ?? id} to={id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
