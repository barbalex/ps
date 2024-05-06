import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createWidgetType } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: rows = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createWidgetType()
    await db.widget_types.create({ data })
    navigate({ pathname: data.widget_type_id, search: searchParams.toString() })
  }, [db.widget_types, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Widget Types"
        addRow={add}
        tableName="widget type"
      />
      <div className="list-container">
        {rows.map(({ widget_type_id, label }) => (
          <Row
            key={widget_type_id}
            label={label ?? widget_type_id}
            to={widget_type_id}
          />
        ))}
      </div>
    </div>
  )
}
