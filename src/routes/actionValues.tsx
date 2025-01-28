import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: actionValues = [] } = useLiveQuery(
    db.action_values.liveMany({
      where: { action_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const actionValue = createActionValue()
    await db.action_values.create({
      data: {
        ...actionValue,
        action_id,
      },
    })
    navigate({
      pathname: actionValue.action_value_id,
      search: searchParams.toString(),
    })
  }, [action_id, db.action_values, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Values"
        addRow={add}
        tableName="action value"
      />
      <div className="list-container">
        {actionValues.map(({ action_value_id, label }) => (
          <Row
            key={action_value_id}
            label={label ?? action_value_id}
            to={action_value_id}
          />
        ))}
      </div>
    </div>
  )
})
