import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createCheckValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const results = useLiveQuery(
    `SELECT * FROM check_values WHERE check_id = $1 ORDER BY label ASC`,
    [check_id],
  )
  const checkValues = results?.rows ?? []

  const add = useCallback(async () => {
    const rawCheckValue = createCheckValue()
    const checkValue = {
      ...rawCheckValue,
      check_id,
    }.join(',')
    const values = Object.values(checkValue).join("','")
    const sql = `INSERT INTO check_values (${columns}) VALUES ('${values}')`
    await db.query(sql)
    navigate({
      pathname: checkValue.check_value_id,
      search: searchParams.toString(),
    })
  }, [check_id, db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Check Values"
        addRow={add}
        tableName="check value"
      />
      <div className="list-container">
        {checkValues.map(({ check_value_id, label }) => (
          <Row
            key={check_value_id}
            label={label ?? check_value_id}
            to={check_value_id}
          />
        ))}
      </div>
    </div>
  )
})
