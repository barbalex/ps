import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM action_values WHERE action_id = $1 order by label asc`,
    [action_id],
  )
  const actionValues = result?.rows ?? []

  const add = useCallback(async () => {
    const actionValue = { ...createActionValue(), action_id }
    const columns = Object.keys(actionValue)
    const values = Object.values(actionValue).join("','")
    const sql = `insert into action_values (${columns}) values ('${values}')`
    await db.query(sql)
    navigate({
      pathname: actionValue.action_value_id,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, searchParams])

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
