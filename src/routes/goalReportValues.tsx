import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { goal_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM goal_report_values WHERE goal_report_id = $1 ORDER BY label ASC`,
    [goal_report_id],
  )
  const goalReportValues = result?.rows ?? []

  const add = useCallback(async () => {
    const newGoalReport = { ...createGoalReportValue(), goal_report_id }
    const columns = Object.keys(newGoalReport).join(',')
    const values = Object.values(newGoalReport)
    const sql = `INSERT INTO goal_report_values (${columns}) VALUES (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({
      pathname: newGoalReport.goal_report_value_id,
      search: searchParams.toString(),
    })
  }, [db, goal_report_id, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goal Report Values"
        nameSingular="Goal Report Value"
        tableName="goal_report_values"
        isFiltered={false}
        countFiltered={goalReportValues.length}
        addRow={add}
      />
      <div className="list-container">
        {goalReportValues.map(({ goal_report_value_id, label }) => (
          <Row
            key={goal_report_value_id}
            label={label ?? goal_report_value_id}
            to={goal_report_value_id}
          />
        ))}
      </div>
    </div>
  )
})
