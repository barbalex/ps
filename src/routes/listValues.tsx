import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createListValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { list_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results } = useLiveQuery(
    db.list_values.liveMany({
      where: { list_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const listValue = createListValue()
    await db.list_values.create({
      data: {
        ...listValue,
        list_id,
      },
    })
    navigate({
      pathname: listValue.list_value_id,
      search: searchParams.toString(),
    })
  }, [db.list_values, list_id, navigate, searchParams])

  const listValues = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="List Values"
        addRow={add}
        tableName="list value"
      />
      <div className="list-container">
        {listValues.map(({ list_value_id, label }) => (
          <Row
            key={list_value_id}
            to={list_value_id}
            label={label ?? list_value_id}
          />
        ))}
      </div>
    </div>
  )
})
