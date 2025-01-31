import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createActionReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM action_reports WHERE action_id = $1 order by label asc`,
    [action_id],
  )
  const actionReports = result?.rows ?? []

  const add = useCallback(async () => {
    const data = await createActionReport({
      db,
      project_id,
      action_id,
    })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into action_reports (${columns}) values ($1)`
    await db.query(sql, values)
    navigate({
      pathname: data.action_report_id,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Reports"
        addRow={add}
        tableName="action report"
      />
      <div className="list-container">
        {actionReports.map(({ action_report_id, label }) => (
          <Row
            key={action_report_id}
            label={label ?? account_report_id}
            to={action_report_id}
          />
        ))}
      </div>
    </div>
  )
})
